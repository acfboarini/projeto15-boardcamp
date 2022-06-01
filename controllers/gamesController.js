import db from "./../db.js";

export async function getGames(req, res) {

    try {
        const result = await db.query(`SELECT * FROM games`);
        return res.status(200).send(result.rows);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function postGame(req, res) {

    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;

    try {
        const post = await db.query(
            `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES (
                $1, $2, $3, $4, $5
            )`, 
            [name, image, stockTotal, categoryId, pricePerDay]
        );
        return res.status(200).send("dados de jogo inseridos com sucesso");

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}