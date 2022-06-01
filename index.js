import dotenv from 'dotenv';
import express, { json } from "express";
import chalk from "chalk";
import cors from "cors";
import pg from "pg"; 
import dayjs from "dayjs";

dotenv.config();

const {Pool} = pg;

const db = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "1506",
    database: "boardcamp"
});

const app = express();
app.use(json());
app.use(cors());

app.get("/categories", async (req, res) => {

    try {
        const result = await db.query(`SELECT * FROM categories`);
        return res.status(200).send(result.rows);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.post("/categories", async (req, res) => {

    const {name} = req.body;

    try {
        const post = await db.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);
        return res.status(200).send("dados de categoria inseridos com sucesso");

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.get("/games", async (req, res) => {

    try {
        const result = await db.query(`SELECT * FROM games`);
        return res.status(200).send(result.rows);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.post("/games", async (req, res) => {

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
})

app.get("/customers", async (req, res) => {

    try {
        const result = await db.query(`SELECT * FROM customers`);
        return res.status(200).send(result.rows);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.post("/customers", async (req, res) => {

    const {name, phone, cpf, birthday} = req.body;

    try {
        console.log(birthday);
        const post = await db.query(
            `INSERT INTO customers (name, phone, cpf, birthday) VALUES (
                $1, $2, $3, $4
            )`, 
            [name, phone, cpf, birthday]
        );
        return res.status(200).send("dados de usuario inseridos com sucesso");

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.get("/customers/:id", async (req, res) => {

    const {id} = req.params;

    try {
        const result = await db.query(`SELECT * FROM customers WHERE id = $1`, [id]);
        return res.status(200).send(result.rows[0]);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.put("/customers/:id", async (req, res) => {
    
    const {id} = req.params;
    const {name, phone, cpf, birthday} = req.body;

    try {
        const result = await db.query(`UPDATE customers 
        SET
            name = $1, 
            phone = $2, 
            cpf = $3, 
            birthday = $4

        WHERE id = $5`, [name, phone, cpf, birthday, id]);
        return res.sendStatus(200);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.get("/rentals", async (req, res) => {

    let array = [];

    try {
        const result = await db.query(`SELECT * FROM rentals`);
        await Promise.all(result.rows.map(async aluguel => {
            const {customerId, gameId} = aluguel;
            const customer = await db.query(`SELECT id, name FROM customers WHERE id = $1`, [customerId]);
            const game = await db.query(`SELECT id, name, "categoryId" FROM games WHERE id = $1`, [gameId]);
            const nomeCategoria = await db.query(`SELECT * FROM categories WHERE id=$1`, [game.rows[0].categoryId]);

            const obj = {
                ...aluguel,
                customer: {...customer.rows[0]},
                game: {...game.rows[0], ...nomeCategoria.rows[0]}
            }

            array.push(obj);
        })) 
        return res.status(200).send(array);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.post("/rentals", async (req, res) => {

    const {customerId, gameId, daysRented} = req.body;
    const date = dayjs().format('YYYY/MM/DD');

    const game = await db.query(`SELECT "pricePerDay" FROM games WHERE id = $1`, [gameId]);
    const {pricePerDay} = game.rows[0];
    const originalPrice = pricePerDay*daysRented;

    try {
        const post = await db.query(
            `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "originalPrice") VALUES (
                $1, $2, $3, $4, $5
            )`, 
            [customerId, gameId, date, daysRented, originalPrice]
        );
        return res.status(200).send("dados de aluguel inseridos com sucesso");

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.delete("/rentals/:id", async (req, res) => {
    
    const {id} = req.params;

    try {
        await db.query(`DELETE FROM rentals WHERE id=$1`, [id]);
        return res.sendStatus(200);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

app.post("/rentals/:id/return", async (req, res) => {

    const date = dayjs().format('YYYY/MM/DD');
    const {id} = req.params;
    const result = await db.query(`SELECT "rentDate", "daysRented", "gameId" FROM rentals WHERE id=${id}`);
    const {rentDate, daysRented, gameId} = result.rows[0];
    if (!gameId) return res.sendStatus(404);

    try {
        let delayFee;
        let n = delayDays(rentDate, daysRented);

        if (n === 0) {
            delayFee = 0;
        } else {
            const {pricePerDay} = await db.query(`SELECT pricePerDay FROM games WHERE id=$1`, [gameId]);
            delayFee = n*pricePerDay;
        }

        const result = await db.query(`UPDATE rentals 
        SET
            "returnDate" = $1,
            "delayFee" = $2

        WHERE id=$3`, [date, delayFee, id]);
        return res.sendStatus(200);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
})

function delayDays(rentDate, daysRented) {
    const qtdDays = dayjs().diff(rentDate, 'days');
    const delayDays = qtdDays - daysRented;

    if (delayDays > 0) return ((-1)*delayDays);
    return 0;
} 

const PORTA = process.env.PORT || 4000;
app.listen(PORTA, () => console.log(chalk.bold.green(`Servidor online na porta ${PORTA}`)));