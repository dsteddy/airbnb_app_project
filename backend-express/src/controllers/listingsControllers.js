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

module.exports = {
    getListings,
    getListingsCount,
    getListingById
}