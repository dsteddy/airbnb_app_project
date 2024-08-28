const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const listingsControllers = require ("./controllers/listingsControllers");
const userControllers = require("./controllers/userControllers");

// Listings
app.get("/api/listings", listingsControllers.getListings);
app.get("/api/listings/count", listingsControllers.getListingsCount);
app.get("/api/listings/:id", listingsControllers.getListingById);
app.post("/api/listings", listingsControllers.postListing);
app.delete("/api/listings/:id", listingsControllers.deleteListingById);
app.put("/api/listings/:id", listingsControllers.editListingById);

// Users
app.get("/api/users", userControllers.getUsers);
app.get("/api/users/:id", userControllers.getUserById);
app.post("/api/users", userControllers.postUser);
app.delete("/api/users/:id", userControllers.deleteUser);
app.put("/api/users/:id", userControllers.editUserById);

module.exports = app;