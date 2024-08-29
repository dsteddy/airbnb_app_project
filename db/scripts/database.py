import os
import logging
import pymysql
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection_params() -> dict:
    """
    Get all the parameters used to connect to the MySQL DB from the .env file.
    """
    host = os.getenv("MYSQL_HOST")
    port = int(os.getenv("MYSQL_PORT", 3306))
    user = os.getenv("MYSQL_USER")
    password = os.getenv("MYSQL_ROOT_PASSWORD")
    database = os.getenv("MYSQL_DATABASE")

    if not all([host, port, user, password, database]):
        logger.error("Database connection parameters are not set properly.")
    else:
        return {
            "host": host,
            "port": port,
            "user": user,
            "password": password,
            "database": database
        }

def create_db_connection(params: dict):
    """
    Use pymysql to create a connection to the MySQL DB.
    """
    try:
        connection = pymysql.connect(
            host=params['host'],
            port=params['port'],
            user=params['user'],
            password=params['password'],
            database=params['database']
        )
        return connection
    except pymysql.MySQLError as e:
        logger.error(f"Failed to connect to the database: {e}")

def create_listings_table(cursor):
    """
    Create the listings table in the MySQL DB if it doesn't already exist.
    """
    create_table_query = """
       CREATE TABLE IF NOT EXISTS listings (
            id INT PRIMARY KEY,
            name VARCHAR(255),
            description TEXT,
            neighborhood_overview TEXT,
            picture_url VARCHAR(512),
            host_id INT,
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

def insert_listings_data(cursor, listings_df: pd.DataFrame):
    """
    Insert all values from the listings DataFrame into the listings table in the MySQL DB.
    """
    insert_query = """
        INSERT INTO listings (
            id, name, description, neighborhood_overview, picture_url, host_id,
            neighbourhood_cleansed, latitude, longitude, room_type, amenities, price, minimum_nights,
            maximum_nights, number_of_reviews, number_of_reviews_l30d, review_scores_rating,
            review_scores_cleanliness, review_scores_checkin, review_scores_communication,
            review_scores_location
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        );
    """
    for _, row in listings_df.iterrows():
        try:
            cursor.execute(insert_query, tuple(row))
        except pymysql.MySQLError as e:
            logger.error(f"Failed to insert row with ID {row['id']}: {e}")
            continue

def create_users_table(cursor):
    """
    Create the users table in the MySQL DB if it doesn't already exist.
    """
    create_table_query = """
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            description TEXT,
            picture_url TEXT,
            housing TEXT,
            is_host TINYINT(1) NOT NULL
        );
    """
    cursor.execute(create_table_query)

def insert_users_data(cursor, user_df: pd.DataFrame):
    """
    Insert all values from the users DataFrame into the users table in the MySQL DB.
    """
    insert_query = """
        INSERT INTO users (id, name, email, password, description, picture_url, housing, is_host)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
    """

    for _, row in user_df.iterrows():
        cursor.execute(insert_query, (
            row['id'],
            row['name'],
            row['email'],
            row['password'],
            row['description'],
            row['picture_url'],
            row['housing'],
            row['is_host']
        ))

def add_foreign_key(cursor):
    """
    Create the foreign key rule between the listings and users tables.
    """
    alter_table_query = """
    ALTER TABLE listings
    ADD CONSTRAINT fk_host_id
    FOREIGN KEY (host_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;
    """
    cursor.execute(alter_table_query)
