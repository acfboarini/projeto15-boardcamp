import { Router } from "express";
import { getRentals, postRental, deleteRental, returnRental } from "./../controllers/rentalsController.js";

const rentalsRouter = new Router();

rentalsRouter.get("/rentals", getRentals);

rentalsRouter.post("/rentals", postRental);

rentalsRouter.delete("/rentals/:id", deleteRental);

rentalsRouter.post("/rentals/:id/return", returnRental);

export default rentalsRouter;