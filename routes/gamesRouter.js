import { Router } from "express";
import { getGames, postGame } from "./../controllers/gamesController.js";

const gamesRouter = new Router(); 

gamesRouter.get("/games", getGames);

gamesRouter.post("/games", postGame);

export default gamesRouter;