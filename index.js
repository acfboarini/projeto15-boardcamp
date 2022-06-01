import dotenv from 'dotenv';
import express, { json } from "express";
import chalk from "chalk";
import cors from "cors";
import dayjs from "dayjs";

import customersRouter from "./routes/customersRouter.js";
import gamesRouter from "./routes/gamesRouter.js";
import rentalsRouter from "./routes/rentalsRouter.js";
import categoriesRouter from "./routes/categoriesRouter.js";

const app = express();

app.use(json());
app.use(cors());

app.use(customersRouter);
app.use(gamesRouter);
app.use(rentalsRouter);
app.use(categoriesRouter);

dotenv.config();

const PORTA = process.env.PORT || 4000;
app.listen(PORTA, () => console.log(chalk.bold.green(`Servidor online na porta ${PORTA}`)));