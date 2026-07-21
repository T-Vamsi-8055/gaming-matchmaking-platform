import {Router} from "express";
import { handleCreateParty,handleJoinParty } from "../controllers/partyController";


const route =Router();

route.get("/join-party",
    handleJoinParty
);

route.post("/create-party",
    handleCreateParty
)

export default route;