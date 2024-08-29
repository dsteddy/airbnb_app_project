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
    const hashedPassword = bcrypt.hashSync(password, 8)

    database
        .execute('SELECT MAX(id) AS maxId FROM users')
        .then(([maxIdResult]) => {
            const maxId = maxIdResult[0].maxId || 0;
            const newId = maxId + 1

            const description = '';
            const picture_url = 'https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg';
            const housing = '';
            const is_host = 0;

            const sqlQuery = `INSERT INTO users
                (id, name, email, password, description, picture_url, housing, is_host)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [newId, name, email, hashedPassword, description, picture_url, housing, is_host];

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

    let hashedPassword;

    if (password) {
        hashedPassword = bcrypt.hashSync(password, 8);
    }

    const sqlQuery = `
    UPDATE users
    SET name = ?, email = ?, password = ?, description = ?, picture_url = ?
    where id = ?`;

    const values = [name, email, hashedPassword || password, description, picture_url, idToEdit];

    database
        .query(sqlQuery, [values])
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

const loginUser = (req, res) => {
    const { email, password } = req.body;

    const sqlQuery = 'SELECT * FROM users WHERE email = ?';
    database
        .query(sqlQuery, [email])
        .then(([users]) => {
            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = users[0];
            const passwordIsValid = bcrypt.compareSync(password, user.password);

            if (!passwordIsValid) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            const token = jwt.sign({ id: user.id, is_host: user.is_host }, process.env.JWT_SECRET, {
                expiresIn: 86400, // 24 hours
            });

            res.status(200).json({
                id: user.id,
                email: user.email,
                token: token,
            });
        })
        .catch((err) => {
            res.status(500).json({ error: err.message });
        });
};

module.exports = {
    getUsers,
    getUserById,
    postUser,
    deleteUser,
    editUserById,
    loginUser,
}