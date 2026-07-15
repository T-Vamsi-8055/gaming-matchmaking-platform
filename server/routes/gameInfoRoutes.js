import {Router} from "express";
import {handleGameInfo} from "../controllers/gameInfoController";

const route=Router();

route.get("/:game_name",
    handleGameInfo
)
export {route}