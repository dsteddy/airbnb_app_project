import requests
import gzip
import pandas as pd
import os
import logging
import random
import string

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_csv(csv_url: str, csv_file_path: str) -> bool:
    try:
        response = requests.get(csv_url)
        response.raise_for_status()
        with open(csv_file_path, 'wb') as file:
            file.write(response.content)
        logger.info("Downloaded GZ file.")
        return True
    except requests.RequestException as e:
        logger.error(f"Failed to download GZ file: {e}")
        return False

def load_csv_to_dataframe(csv_file_path: str) -> pd.DataFrame:
    try:
        with gzip.open(csv_file_path, 'rb') as f:
            df = pd.read_csv(f)
        logger.info("CSV file loaded into DataFrame")
        return df
    except Exception as e:
        logger.error(f"Failed to load CSV file into DataFrame: {e}")
        return None

def remove_csv(csv_file_path):
    try:
        os.remove(csv_file_path)
        logger.info(f"Removed the gz file: {csv_file_path}")
    except OSError as e:
        logger.error(f"Error removing the gz file: {e}")

def clean_listings(df: pd.DataFrame) -> pd.DataFrame:
    # Drop unnecessary columns
    cols_to_drop = [
        "listing_url",
        "scrape_id",
        "property_type",
        "last_scraped",
        "source",
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

    # Reset ID
    df_cleaned = df_cleaned.drop(columns='id').reset_index()
    df_cleaned.rename({'index' : 'id'}, axis=1, inplace=True)

    return df_cleaned

def create_user_df(df: pd.DataFrame) -> pd.DataFrame:
    # Extract necessary columns
    host_data = df[['host_name', 'host_about', 'host_picture_url', 'host_id', 'id']].copy()

    # Generate random emails and passwords
    def generate_email(host_name):
        return f"{host_name.lower().replace(' ', '_')}@example.com"

    def generate_password(length=10):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    # Process host data
    user_data = {}
    for _, row in host_data.iterrows():
        host_id = row['host_id']
        if host_id not in user_data:
            user_data[host_id] = {
                'host_id': host_id,
                'name': row['host_name'],
                'email': generate_email(row['host_name']),
                'password': generate_password(),
                'description': row['host_about'] if pd.notna(row['host_about']) else '',
                'picture_url': row['host_picture_url'] if pd.notna(row['host_picture_url']) else '',
                'housing': [row['id']],
                'is_host': 1
            }
        else:
            user_data[host_id]['housing'].append(row['id'])

    user_df = pd.DataFrame(user_data.values())
    user_df = user_df.rename(columns={'host_id': 'id'})
    user_df['housing'] = user_df['housing'].apply(lambda x: ','.join(map(str, x)))

    return user_df