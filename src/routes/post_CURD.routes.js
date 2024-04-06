import { Router } from "express";
import {
  isAdmin,
  isLoggedIn,
  verifyJwt,
} from "../middleware/auth.middleware.js";
import {
  createPost,
  deletePost,
  getAllPost,
  getAllPostsOfLoggedAdmin,
  getGenrePost,
  getLatestPost,
  getMostLikedPost,
  getSpecificPost,
} from "../controllers/post.controllers.js";
import upload from "../middleware/multer.middleware.js";

const postRouter = Router();

// only for admin...
postRouter.route("/createpost").post(
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

postRouter
  .route("/admin/getallpost")
  .get(verifyJwt, isLoggedIn, isAdmin, getAllPostsOfLoggedAdmin);

// fetch all the posts either user is loggedIn or not...
postRouter.route("/getallpost").get(getAllPost);

postRouter.route("/genres").get(getGenrePost);

postRouter.route("/getmostliked").get(getMostLikedPost);

postRouter.route("/getlatest").get(getLatestPost);

postRouter.route("/post").get(getSpecificPost);

postRouter
  .route("/admin/deletepost/:postid")
  .get(verifyJwt, isLoggedIn, isAdmin, deletePost);

export default postRouter;
