import {Router} from "express";
import { handleCreateParty } from "../controllers/partyControllers/createParty.js";
import { handleJoinParty } from "../controllers/partyControllers/joinParty.js";
import { getParty } from "../controllers/partyControllers/getParty.js";
import { leaveParty } from "../controllers/partyControllers/leaveParty.js";
import {verifyJWT} from "../middlewares/authMiddleware.js"
import { getMyParties } from "../controllers/partyControllers/myParties.js";

const route =Router();

route.post("/join-party",verifyJWT,
    handleJoinParty
);

route.post("/create-party",verifyJWT,
    handleCreateParty
)

route.post("/leave-party",
    leaveParty
)

route.get("/party/:id", verifyJWT, getParty);

router.get(
    "/my-parties",
    verifyJWT,
    getMyParties
);

export default route;