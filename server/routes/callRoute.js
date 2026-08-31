import express from "express";
import {
  getCallHistory,
  checkUserAvailability,
  deleteCallHistoryItem,
} from "../controllers/callController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/history", getCallHistory);
router.post("/check-user", checkUserAvailability);
router.delete("/:callId", deleteCallHistoryItem);

export default router;
