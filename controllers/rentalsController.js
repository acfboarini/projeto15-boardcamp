import db from "./../db.js";

export async function getRentals(req, res) {

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
}

export async function postRental(req, res) {

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
}

export async function deleteRental(req, res) {
    
    const {id} = req.params;

    try {
        await db.query(`DELETE FROM rentals WHERE id=$1`, [id]);
        return res.sendStatus(200);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function returnRental(req, res) {

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
}

function delayDays(rentDate, daysRented) {
    const qtdDays = dayjs().diff(rentDate, 'days');
    const delayDays = qtdDays - daysRented;

    if (delayDays > 0) return ((-1)*delayDays);
    return 0;
} 