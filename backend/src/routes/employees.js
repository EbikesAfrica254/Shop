import express from "express";
import {
  registerEmployee,
  loginEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

import { authenticate, authorize } from "../middleware/auth.js"; // 🛡️ guards

const router = express.Router();

/* ── public endpoints ─────────────────────────── */
router.post("/register", registerEmployee);
router.post("/login",    loginEmployee);

/* ── HR-admin endpoints (require admin role) ──── */
router.use(authenticate, authorize("admin"));   // ⬅️ guard every route below

router.get("/",     listEmployees);             // GET    /api/employees
router.get("/:id",  getEmployee);               // GET    /api/employees/7
router.put("/:id",  updateEmployee);            // PUT    /api/employees/7
router.delete("/:id", deleteEmployee);          // DELETE /api/employees/7

export default router;
