import express from 'express';
import cookieParser from 'cookie-parser';
import {route as authRoute} from './routes/authRoutes.js';
import {route as profileRoute} from './routes/profileRoutes.js';
import {route as gameDataRoute} from './routes/gameInfoRoutes.js';
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();

const app=express();
const PORT=3000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use("/uploads",express.static("uploads"));

app.use(cookieParser());
app.use("/api/auth",authRoute);
app.use("/api/profile",profileRoute);
app.use("/api/game-data",gameDataRoute);

app.listen(PORT,()=>console.log(`Server started at http://localhost:${PORT}`));