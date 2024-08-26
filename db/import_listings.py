import requests
import pymysql
import pandas as pd
import os
from dotenv import load_dotenv
from contextlib import closing
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def import_listings(download: bool = False):
    host = os.getenv("MYSQL_HOST")
    port = int(os.getenv("MYSQL_PORT", 3306))
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_ROOT_PASSWORD")
    database = os.getenv("MYSQL_DATABASE")

    if not all([host, port, user, password, database]):
        logger.error("Database connection parameters are not set properly.")
        return

    csv_url = 'https://data.insideairbnb.com/france/ile-de-france/paris/2024-06-10/visualisations/listings.csv'
    csv_file_path = 'listings.csv'

    if download or not os.path.exists(csv_file_path):
        try:
            response = requests.get(csv_url)
            response.raise_for_status()
            with open(csv_file_path, 'wb') as file:
                file.write(response.content)
            logger.info("Downloaded CSV file.")
        except requests.RequestException as e:
            logger.error(f"Failed to download CSV file: {e}")
            return

    listings_df = pd.read_csv(csv_file_path)
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
                    id BIGINT PRIMARY KEY,
                    name VARCHAR(255),
                    host_id BIGINT,
                    host_name VARCHAR(255),
                    neighbourhood VARCHAR(255),
                    latitude DECIMAL(10, 7),
                    longitude DECIMAL(10, 7),
                    room_type VARCHAR(50),
                    price DECIMAL(10, 2),
                    minimum_nights INT,
                    number_of_reviews INT,
                    reviews_per_month DECIMAL(15, 2),
                    calculated_host_listings_count INT,
                    availability_365 INT,
                    number_of_reviews_ltm INT
                );
                """
                cursor.execute(create_table_query)

                insert_query = """
                INSERT INTO listings (
                    id, name, host_id, host_name, neighbourhood,
                    latitude, longitude, room_type, price, minimum_nights, number_of_reviews,
                    reviews_per_month, calculated_host_listings_count,
                    availability_365, number_of_reviews_ltm
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
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
    cols_to_drop = ["neighbourhood_group", "license", "last_review"]
    df_cleaned = df.drop(columns=cols_to_drop)

    # Replace NaN with 0 for reviews_per_month and price
    cols_nan_to_zero = ["reviews_per_month", "price"]
    for col in cols_nan_to_zero:
        df_cleaned[col] = df_cleaned[col].fillna(0.00)

    # Replace NaN with None (NULL) for last_review
    cols_nan_to_null = []
    for col in cols_nan_to_null:
        df_cleaned[col] = df_cleaned[col].where(pd.notna(df_cleaned[col]), None)

    # Drop missing host_name
    cols_nan_to_drop = ["host_name"]
    df_cleaned = df_cleaned.dropna(subset=cols_nan_to_drop)

    return df_cleaned

if __name__ == "__main__":
    import_listings(download=True)