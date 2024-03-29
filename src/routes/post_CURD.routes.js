import { Router } from "express";
import {
  isAdmin,
  isLoggedIn,
  verifyJwt,
} from "../middleware/auth.middleware.js";
import { createPost } from "../controllers/post.controllers.js";
import upload from "../middleware/multer.middleware.js";

const postRouter = Router();

postRouter.route("/createPost").post(
  verifyJwt,
  isLoggedIn,
  isAdmin,
  upload.fields([
    {
      name: "images", // Field name in form-data
      maxCount: 3, // Maximum number of images allowed in the array
    },
  ]),
  createPost
);

export default postRouter;
