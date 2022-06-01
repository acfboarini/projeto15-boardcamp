import pg from "pg"; 
import dotenv from "dotenv";

dotenv.config();

const {Pool} = pg;

const host = process.env.HOST;
const port = process.env.SQL_PORT;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

const db = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "1506",
    database: "boardcamp"
});

export default db;