const database = require("../../database");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = (req, res) => {
    const sqlQuery = "SELECT * FROM users LIMIT 32;"

    database
        .query(sqlQuery)
        .then(([users]) => {
            res.json(users);
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        })
};

const getUserById = (req, res) => {
    const id = req.params.id;
    const sqlQuery = "SELECT * FROM users WHERE id = ?;"

    database
        .query(sqlQuery, [id])
        .then(([user]) => {
            if (user[0] != null) {
                res.json(user[0])
            } else {
                res.sendStatus(404);
            }
        })
        .catch((err) => {
            console.error(err);
            res.sendStatus(500);
        });
};

const postUser = (req, res) => {
    const { name, email, password, description, picture_url } = req.body;
    // const hashedPassword = bcrypt.hashSync(password, 8)

    database
        .execute('SELECT MAX(id) AS maxId FROM users')
        .then(([maxIdResult]) => {
            const maxId = maxIdResult[0].maxId || 0;
            const newId = maxId + 1

            const housing = '';
            const is_host = 0;

            const sqlQuery = `INSERT INTO users
                (id, name, email, password, description, picture_url, housing, is_host)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [newId, name, email, password, description, picture_url, housing, is_host];

            return database.execute(sqlQuery, values);
        })
        .then(() => {
            res.status(201).json({ message: 'User added succesfully!' });
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

const deleteUser = (req, res) => {
    const idToDelete = parseInt(req.params.id)
    const sqlQuery = "DELETE FROM users WHERE id = ?"
    database
        .query(sqlQuery, [idToDelete])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: "User not found " });
            }
            res.status(200).send({ message: `Listing with id ${idToDelete} deleted successfully` })
        })
        .catch((err) => {
            console.error("Error deleting user from database");
            res.status(500).send({ error: "Error deleting user" });
        });
};

const editUserById = (req, res) => {
    const idToEdit = parseInt(req.params.id)
    const { name, email, password, description, picture_url } = req.body;
    const sqlQuery = "UPDATE users SET name = ?, email = ?, password = ?, description = ?, picture_url = ? where id = ?"
    database
        .query(sqlQuery, [name, email, password, description, picture_url, idToEdit])
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: "User not found " });
            }
            res.status(204).send({ message: `User with id ${idToEdit} updated succesfully` })
        })
        .catch((err) => {
            console.error("Error updating user from the database", err);
            res.status(500).send({ error: "Error updating user " });
        });
};

module.exports = {
    getUsers,
    getUserById,
    postUser,
    deleteUser,
    editUserById
}