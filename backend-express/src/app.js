const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const listingsControllers = require ("./controllers/listingsControllers");

app.get("/api/listings", listingsControllers.getListings);
app.get("/api/listings/count", listingsControllers.getListingsCount);
app.get("/api/listings/:id", listingsControllers.getListingById);
app.post("/api/listings", listingsControllers.postListing);

module.exports = app;