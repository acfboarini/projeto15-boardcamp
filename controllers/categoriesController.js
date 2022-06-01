import db from "./../db.js";

export async function getCategories(req, res) {

    try {
        const result = await db.query(`SELECT * FROM categories`);
        return res.status(200).send(result.rows);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function postCategorie(req, res) {

    const {name} = req.body;

    try {
        const post = await db.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);
        return res.status(200).send("dados de categoria inseridos com sucesso");

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}