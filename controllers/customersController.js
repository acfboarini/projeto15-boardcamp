import db from "./../db.js";

export async function getCustomers(req, res) {

    try {
        const result = await db.query(`SELECT * FROM customers`);
        return res.status(200).send(result.rows);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function postCustomer(req, res) {

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
}

export async function getCustomerId(req, res) {

    const {id} = req.params;

    try {
        const result = await db.query(`SELECT * FROM customers WHERE id = $1`, [id]);
        return res.status(200).send(result.rows[0]);

    } catch(err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

export async function putCustomer(req, res) {
    
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
}