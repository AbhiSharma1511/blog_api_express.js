import { Router } from "express";
import { isAdmin, isLoggedIn, verifyJwt } from "../middleware/auth.middleware.js";
import { getAllUsers } from "../controllers/user.controllers.js";

const adminRoute = Router();

adminRoute.route("/getAllUsers").get(verifyJwt, isLoggedIn, isAdmin, getAllUsers);

export default adminRoute;