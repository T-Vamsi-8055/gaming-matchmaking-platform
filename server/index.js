import express from 'express';
import cookieParser from 'cookie-parser';
import route from './routes/authRoutes';
const app=express();
const PORT=3000;
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",route);

app.listen(PORT,()=>console.log(`Server started at http://localhost:${PORT}`));