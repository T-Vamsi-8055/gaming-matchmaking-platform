import {Router} from "express";
import {handleGameInfo} from "../controllers/gameInfoController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const route=Router();

route.get("/:game_name",
    verifyJWT,
    handleGameInfo
)
export {route}