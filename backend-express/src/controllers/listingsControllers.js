const database = require("../../database");

const getListings = (req, res) => {
    const perPage = 18;
    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    const offset = (page - 1) * perPage;
    const sqlQuery = "\
        SELECT *\
        FROM listings\
        ORDER BY \
            number_of_reviews_l30d DESC,\
            review_scores_rating DESC,\
            number_of_reviews DESC\
        LIMIT ? OFFSET ?;"
    const sqlValues = [perPage, offset];
    database
        .query(sqlQuery, sqlValues)
        .then(([listingsResult]) => {
            res.json(listingsResult);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
};

const getListingsCount = (req, res) => {
    const sqlQuery = "SELECT COUNT(*) as total_rows FROM listings;"
    database
        .query(sqlQuery)
        .then(([listingsCount]) => {
            res.json(listingsCount[0])
        })
        .catch((err) => {
            console.error(err)
            res.sendStatus(500);
        });
};


const getListingById = (req, res) => {
    const id = req.params.id;
    console.log(id)
    const sqlQuery = "SELECT * FROM listings WHERE id = ?"
    database
        .query(sqlQuery, [id])
        .then(([listing]) => {
            if (listing[0] != null) {
                res.json(listing[0])
            } else {
                res.sendStatus(404);
            }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
};

const postListing = (req, res) => {
    // Destructure the request body to get the form values
    const {
        name, description, neighborhood_overview, picture_url, host_name, host_about,
        host_picture_url, neighbourhood_cleansed, latitude, longitude, room_type,
        amenities, price, minimum_nights, maximum_nights
    } = req.body;

    // Query the maximum ID from the database
    database.execute('SELECT MAX(id) AS maxId FROM listings')
        .then(([maxIdResult]) => {
            const maxId = maxIdResult[0].maxId || 0;
            const newId = maxId + 1

            // Set other columns to default values
            const number_of_reviews = 0;
            const number_of_reviews_l30d = 0;
            const review_scores_rating = 0;
            const review_scores_cleanliness = 0;
            const review_scores_checkin = 0;
            const review_scores_communication = 0;
            const review_scores_location = 0;

            const sqlQuery = `INSERT INTO listings
                 (id, name, description, neighborhood_overview, picture_url, host_name, host_about, host_picture_url,
                  neighbourhood_cleansed, latitude, longitude, room_type, amenities, price, minimum_nights,
                  maximum_nights, number_of_reviews, number_of_reviews_l30d, review_scores_rating,
                  review_scores_cleanliness, review_scores_checkin, review_scores_communication, review_scores_location)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [newId, name, description, neighborhood_overview, picture_url, host_name, host_about, host_picture_url,
                neighbourhood_cleansed, latitude, longitude, room_type, amenities, price, minimum_nights,
                maximum_nights, number_of_reviews, number_of_reviews_l30d, review_scores_rating, review_scores_cleanliness,
                review_scores_checkin, review_scores_communication, review_scores_location];

            return database.execute(sqlQuery, values);
        })
        .then(() => {
            res.status(201).json({ message: 'Listing added successfully!' });
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

const deleteListingById = (req, res) => {
    const idToDelete = parseInt(req.params.id)
    const sqlQuery = "DELETE FROM listings WHERE id = ?"
    database
        .query(sqlQuery, [idToDelete])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: "Listing not found "});
            }
            res.status(200).send({ message: `Listing with id ${idToDelete} deleted successfully`})
        })
        .catch((err) => {
            console.error("Error deleting user from the database:", err);
            res.status(500).send({ error: "Error deleting user "});
        });
}


module.exports = {
    getListings,
    getListingsCount,
    getListingById,
    postListing,
    deleteListingById,
}