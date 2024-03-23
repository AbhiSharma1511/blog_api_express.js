import express,{json} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"20Kb"}));
app.use(express.urlencoded({extended: true, limit:"20Kb"}));
app.use(express.static("public"));
app.use(cookieParser())



export {app}
