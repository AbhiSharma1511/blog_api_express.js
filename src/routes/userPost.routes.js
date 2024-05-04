import { Router } from "express";
import { updateLike, updateSave } from "../controllers/user.controllers.js";

const userPostRouter = Router();

// when user like the posts
userPostRouter.route("/likepost").post(updateLike);
userPostRouter.route("/savepost").post(updateSave);

export default userPostRouter
