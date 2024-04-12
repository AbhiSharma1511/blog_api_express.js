import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    // origin: process.env.CORS_ORIGIN,
    origin: 'http://localhost:5173', //only for local development, this is not used in production level...
    credentials: true,
  })
);
// app.use(express.json());
app.use(express.json({ limit: "20Kb" }));
app.use(express.urlencoded({ extended: true, limit: "20Kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes for use
import userRouter from "../src/routes/userAuth.routes.js";
import postRouter from "./routes/post_CURD.routes.js";

// use routes here
app.use("/blog_site/auth", userRouter);
// http://localhost:8000/blog_site/auth/register
// http://localhost:8000/blog_site/auth/login
// http://localhost:8000/blog_site/auth/logout

// for fetching posts
app.use("/blog_site/posts", postRouter);
// http://localhost:8000/blog_site/posts/createPost
// http://localhost:8000/blog_site/posts/getAllPosts
// http://localhost:8000/blog_site/posts/genre?genre={genre}
// http://localhost:8000/blog_site/posts/getmostliked
// http://localhost:8000/blog_site/posts/getlatest
// http://localhost:8000/blog_site/posts/post?_id:{postId}

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something went wrong!");
// });

export { app };
