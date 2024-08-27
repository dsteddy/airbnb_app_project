import requests
import pymysql
import pandas as pd
import os
from dotenv import load_dotenv
from contextlib import closing
import logging
from io import BytesIO
import gzip

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def import_listings():
    host = os.getenv("MYSQL_HOST")
    port = int(os.getenv("MYSQL_PORT", 3306))
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_ROOT_PASSWORD")
    database = os.getenv("MYSQL_DATABASE")

    if not all([host, port, user, password, database]):
        logger.error("Database connection parameters are not set properly.")
        return

    csv_url = 'https://data.insideairbnb.com/france/ile-de-france/paris/2024-06-10/data/listings.csv.gz'
    csv_file_path = 'listings.csv.gz'

    try:
        response = requests.get(csv_url)
        response.raise_for_status()
        with open(csv_file_path, 'wb') as file:
            file.write(response.content)
        logger.info("Downloaded GZ file.")
    except requests.RequestException as e:
        logger.error(f"Failed to download GZ file: {e}")
        return

    try:
        with gzip.open(csv_file_path, 'rb') as f:
            listings_df = pd.read_csv(f)
        print("CSV file loaded into DF")
    except Exception as e:
        print(f"Failed to load CSV file into DF: {e}")

    try:
        os.remove(csv_file_path)
        logger.info(f"Removed the gz file: {csv_file_path}")
    except OSError as e:
        logger.error(f"Error removing the gz file: {e}")

    listings_df_cleaned = clean_listings(listings_df)

    try:
        with closing(pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database
        )) as connection:
            with closing(connection.cursor()) as cursor:
                create_table_query = """
                    CREATE TABLE IF NOT EXISTS listings (
                        id VARCHAR(255) PRIMARY KEY,
                        name VARCHAR(255),
                        description TEXT,
                        neighborhood_overview TEXT,
                        picture_url VARCHAR(512),
                        host_name VARCHAR(255),
                        host_about TEXT,
                        host_picture_url VARCHAR(512),
                        neighbourhood_cleansed TEXT,
                        latitude DECIMAL(10, 7),
                        longitude DECIMAL(10, 7),
                        room_type VARCHAR(50),
                        amenities TEXT,
                        price DECIMAL(10, 2),
                        minimum_nights INT,
                        maximum_nights INT,
                        number_of_reviews INT,
                        number_of_reviews_l30d INT,
                        review_scores_rating DECIMAL(3, 2),
                        review_scores_cleanliness DECIMAL(3, 2),
                        review_scores_checkin DECIMAL(3, 2),
                        review_scores_communication DECIMAL(3, 2),
                        review_scores_location DECIMAL(3, 2)
                    );
                """
                cursor.execute(create_table_query)

                insert_query = """
                    INSERT INTO listings (
                        id, name, description, neighborhood_overview, picture_url, host_name, host_about,
                        host_picture_url, neighbourhood_cleansed, latitude, longitude, room_type, amenities, price, minimum_nights,
                        maximum_nights, number_of_reviews, number_of_reviews_l30d, review_scores_rating,
                        review_scores_cleanliness, review_scores_checkin, review_scores_communication,
                        review_scores_location
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    );
                """

                bad_rows = []

                for _, row in listings_df_cleaned.iterrows():
                    try:
                        cursor.execute(insert_query, tuple(row))
                    except pymysql.MySQLError as e:
                        logger.error(f"Failed to insert row with ID {row['id']}: {e}")
                        bad_rows.append(row['id'])
                        continue

                if len(bad_rows) > 0:
                    logger.error(f"Bad rows: {len(bad_rows)}")
                    with open('bad_rows.txt', 'w') as file:
                        file.write(bad_rows)

                connection.commit()
                logger.info("Data has been inserted succesfully.")

    except pymysql.MySQLError as e:
        logger.error(f"Database operation failed: {e}")

def clean_listings(df: pd.DataFrame) -> pd.DataFrame:
    # Drop unnecessary columns
    cols_to_drop = [
        "listing_url",
        "scrape_id",
        "property_type",
        "last_scraped",
        "source",
        "host_id",
        "host_url",
        "host_since",
        "host_location",
        "license",
        "accommodates",
        "minimum_minimum_nights",
        "maximum_minimum_nights",
        "minimum_maximum_nights",
        "maximum_maximum_nights",
        "host_response_time",
        "host_response_rate",
        "host_acceptance_rate",
        "host_is_superhost",
        "host_thumbnail_url",
        "host_listings_count",
        "host_total_listings_count",
        "host_verifications",
        "host_has_profile_pic",
        "host_neighbourhood",
        "host_identity_verified",
        "neighbourhood",
        "neighbourhood_group_cleansed",
        # "neighbourhood_cleansed",
        "bathrooms",
        "bathrooms_text",
        "bedrooms",
        "beds",
        "minimum_nights_avg_ntm",
        "maximum_nights_avg_ntm",
        "calendar_last_scraped",
        "number_of_reviews_ltm",
        "instant_bookable",
        "reviews_per_month",
        "first_review",
        "review_scores_accuracy",
        "review_scores_value",
        "has_availability",
        "availability_60",
        "availability_90",
        "availability_30",
        "availability_365",
        "calendar_updated",
        "calculated_host_listings_count",
        "calculated_host_listings_count_entire_homes",
        "calculated_host_listings_count_private_rooms",
        "calculated_host_listings_count_shared_rooms",
        "neighbourhood_group",
         "last_review"]
    cols_to_drop = [col for col in cols_to_drop if col in df.columns]
    df_cleaned = df.drop(columns=cols_to_drop)

    # Replace NaN with empty strings
    cols_nan_to_empty_str = [
        "description",
        "neighborhood_overview",
        "picture_url",
        "host_picture_url",
        "host_about",
        ]
    for col in cols_nan_to_empty_str:
        df_cleaned[col] = df_cleaned[col].fillna('')

    # Remove $ and thousands separator from price
    df_cleaned["price"] = df_cleaned["price"].str.replace('$', '')
    df_cleaned["price"] = df_cleaned['price'].str.replace(',', '')

    # Convert List to String
    df_cleaned["amenities"] = df_cleaned["amenities"].str.replace('[', '').str.replace(']', '').str.replace('"', '').str.replace('\\u2019', "'")

    # # Replace NaN with 0
    # cols_nan_to_zero = [
    #     "price",
    #     "review_scores_rating",
    #     "review_scores_cleanliness",
    #     "review_scores_checkin",
    #     "review_scores_communication",
    #     "review_scores_location",
    #     ]
    # for col in cols_nan_to_zero:
    #     df_cleaned[col] = df_cleaned[col].fillna(0.00)

    # Drop missing host_name
    cols_nan_to_drop = [
        "host_name",
        "price",
        "review_scores_rating",
        "review_scores_cleanliness",
        "review_scores_checkin",
        "review_scores_communication",
        "review_scores_location",
        ]
    df_cleaned = df_cleaned.dropna(subset=cols_nan_to_drop)

    return df_cleaned

if __name__ == "__main__":
    import_listings()