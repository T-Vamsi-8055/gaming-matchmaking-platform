import {Router} from "express";
import { handleCreateParty } from "../controllers/partyController/createParty.js";
import { handleJoinParty } from "../controllers/partyController/joinParty.js";
import { getParty } from "../controllers/partyController/getParty.js";
import { leaveParty } from "../controllers/partyController/leaveParty.js";


const route =Router();

route.post("/join-party",
    handleJoinParty
);

route.post("/create-party",
    handleCreateParty
)

route.post("/leave-party",
    leaveParty
)

route.get("/get-party",
    getParty
)

export default route;