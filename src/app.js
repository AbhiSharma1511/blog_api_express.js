import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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
// http://localhost:8000/blog_site/register
app.use("/blog_site", userRouter);
app.use("/blog_site/post", postRouter);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something went wrong!");
// });

export { app };
