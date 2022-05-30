import dotenv from 'dotenv';
import express, {json} from "express";
import chalk from "chalk";
import cors from "cors";

dotenv.config();

let db = null;
const mongoClient = new MongoClient(process.env.DB_URL);
await mongoClient.connect()
.then(() => {
    //db = mongoClient.db("clothestoreDB");
    console.log(chalk.bold.blue("Contecado ao banco BoardCamp"));
})
.catch(err => {
    console.log(chalk.bold.red("Erro ao conectar com o banco"), err);

})

const app = express();
app.use(json());
app.use(cors());

const PORTA = process.env.PORT || 4000;
app.listen(PORTA, () => console.log(chalk.bold.green(`Servidor online na porta ${PORTA}`)));

