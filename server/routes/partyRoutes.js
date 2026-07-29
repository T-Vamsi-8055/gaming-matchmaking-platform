import {Router} from "express";
import { handleCreateParty } from "../controllers/partyControllers/createParty.js";
import { handleJoinParty } from "../controllers/partyControllers/joinParty.js";
import { getParty } from "../controllers/partyControllers/getParty.js";
import { leaveParty } from "../controllers/partyControllers/leaveParty.js";
import {verifyJWT} from "../middlewares/authMiddleware.js"
import { getMyParties } from "../controllers/partyControllers/myParties.js";
import { searchParties } from "../controllers/partyControllers/searchParties.js";

const route =Router();

route.post("/join-party",verifyJWT,
    handleJoinParty
);

route.post("/create-party",verifyJWT,
    handleCreateParty
)

route.post("/leave-party/:id",verifyJWT,
    leaveParty
)

route.get("/party/:id", verifyJWT, getParty);

route.get(
    "/my-parties",
    verifyJWT,
    getMyParties
);

route.get(
    "/search-parties",verifyJWT,
    searchParties
)

export default route;