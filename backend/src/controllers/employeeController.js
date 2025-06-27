/* ── src/controllers/employeeController.js ───────────────────────── */
import bcrypt from "bcryptjs";
import Joi    from "joi";
import jwt    from "jsonwebtoken";      // ← NEW
import { db } from "../config/db.js";

/* ───── validation schema for sign-up ───── */
const schema = Joi.object({
  fullName:        Joi.string().min(3).required(),
  idNumber:        Joi.string().required(),
  phone:           Joi.string().required(),
  email:           Joi.string().email().required(),
  code:            Joi.string().length(6).required(),
  password:        Joi.string().length(8).required(),
  confirmPassword: Joi.ref("password"),
});

/* ───────────────── register ───────────────── */
export const registerEmployee = async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  const { fullName, idNumber, phone, email, code, password } = value;

  const [existing] = await db.query(
    "SELECT id FROM employees WHERE email = ? OR id_number = ?",
    [email, idNumber]
  );
  if (existing.length)
    return res.status(409).json({ message: "Employee already exists" });

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO employees
     (full_name,id_number,phone,email,code,password_hash,role)
     VALUES (?,?,?,?,?,?, 'pending')`,
    [fullName, idNumber, phone, email, code, hash]
  );

  res.status(201).json({
    message: "Registered, awaiting approval",
    role: "pending",
  });
};

/* ───────────────── login (now sets JWT cookie) ───────────────── */
export const loginEmployee = async (req, res) => {
  const { code, password } = req.body;

  const [rows] = await db.query(
    "SELECT id, role, password_hash, suspended FROM employees WHERE code=? LIMIT 1",
    [code]
  );
  if (!rows.length) return res.status(400).json({ message: "Code not found" });

  const user = rows[0];

  if (user.suspended)
    return res.status(403).json({ message: "Suspended" });
  if (user.role === "pending")
    return res.status(403).json({ message: "Awaiting approval" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ message: "Wrong password" });

  /* --- issue JWT & http-only cookie ----------------------------- */
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME || "1h" }
  );

  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      // secure: true   // ← uncomment when you switch to HTTPS
    })
    .json({ message: "Logged in", role: user.role });
};

/* ───────── list all employees ───────── */
export const listEmployees = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, id_number, phone, email, role, suspended
         FROM employees`
    );
    res.json(rows);
  } catch (err) {
    console.error("listEmployees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ───────── get one employee ───────── */
export const getEmployee = async (req, res) => {
  const [rows] = await db.query(
    `SELECT id, full_name, id_number, phone, email, role, suspended
       FROM employees
      WHERE id = ?`,
    [req.params.id]
  );
  if (!rows.length)
    return res.status(404).json({ message: "Not found" });
  res.json(rows[0]);
};

/* ───────── update one employee ───────── */
export const updateEmployee = async (req, res) => {
  const {
    full_name,
    id_number,
    phone,
    email,
    role,
    suspended = 0,
  } = req.body;

  await db.query(
    `UPDATE employees SET
       full_name=?,
       id_number=?,
       phone=?,
       email=?,
       role=?,
       suspended=?
     WHERE id=?`,
    [full_name, id_number, phone, email, role, suspended, req.params.id]
  );

  res.json({ message: "Updated" });
};

/* ───────── delete one employee ───────── */
export const deleteEmployee = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM employees WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Not found" });

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("deleteEmployee:", err);
    res.status(500).json({ message: "Server error" });
  }
};
