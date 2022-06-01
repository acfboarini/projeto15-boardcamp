import { Router } from "express";
import { getCustomers, postCustomer, getCustomerId, putCustomer } from "./../controllers/customersController.js";

const customersRouter = new Router();

customersRouter.get("/customers", getCustomers);

customersRouter.post("/customers", postCustomer);

customersRouter.get("/customers/:id", getCustomerId);

customersRouter.put("/customers/:id", putCustomer);

export default customersRouter;