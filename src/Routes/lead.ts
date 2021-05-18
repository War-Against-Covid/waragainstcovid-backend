import { Router } from "express";
import { getAllLeads, getLeadById, createLead } from "../Controller/lead";

const router = Router();

router.get("/", getAllLeads);

router.get("/:id", getLeadById);

router.post("/", createLead);

export default router;
