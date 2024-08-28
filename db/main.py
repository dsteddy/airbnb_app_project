import logging
from contextlib import closing
from scripts.database import (
    get_db_connection_params,
    create_db_connection,
    create_listings_table,
    insert_listings_data,
    create_users_table,
    insert_users_data,
    add_foreign_key
)
from scripts.get_data import (
    download_csv,
    load_csv_to_dataframe,
    remove_csv,
    clean_listings,
    create_user_df,
    remove_host_info_from_listings
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_data_in_db():
    # Step 1: Get database connection parameters
    db_params = get_db_connection_params()
    if not db_params:
        return

    # Step 2: Download the CSV file
    csv_url = 'https://data.insideairbnb.com/france/ile-de-france/paris/2024-06-10/data/listings.csv.gz'
    csv_file_path = 'listings.csv.gz'
    if not download_csv(csv_url, csv_file_path):
        return

    # Step 3: Load CSV into DataFrame
    listings_df = load_csv_to_dataframe(csv_file_path)
    if listings_df is None:
        return

    # Step 4: Clean up the downloaded file
    remove_csv(csv_file_path)

    # Step 5: Clean listings data and create user DataFrame
    listings_df_cleaned = clean_listings(listings_df)
    user_df = create_user_df(listings_df_cleaned)

    # Step 5.2: Delete user info from listings_df
    listings_df_final = remove_host_info_from_listings(listings_df_cleaned)

    # Step 6: Connect to the database
    connection = create_db_connection(db_params)
    if connection is None:
        return

    # Step 7: Create and insert data into the listings table
    with closing(connection.cursor()) as cursor:
        create_listings_table(cursor)
        insert_listings_data(cursor, listings_df_final)
        connection.commit()
        logger.info("Data has been inserted succesfully in listings table.")

        # Step 8: Create and insert data in to the users table
        create_users_table(cursor)
        insert_users_data(cursor, user_df)
        connection.commit()
        logger.info("Data has been inserted succesfully in users table.")

        # Step 9: Add the foreign key between the tables
        add_foreign_key(cursor)
        connection.commit()

    connection.close()

if __name__ == "__main__":
    load_data_in_db()