const database = require("../../database");

const getListings = (req, res) => {
    const perPage = 32;
    let page = parseInt(req.query.page, 10);

    if (isNaN(page) || page < 1) {
        page = 1;
    }

    const offset = (page - 1) * perPage;

    const sqlQuery = "SELECT * FROM listings ORDER BY number_of_reviews DESC LIMIT ? OFFSET ?;";
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
        })
};

module.exports = {
    getListings,
    getListingsCount
}