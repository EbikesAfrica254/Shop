import express from "express";
import multer from "multer";

// Import all controller functions
import {
  createItem,
  listItems,
  listPublicItems,
  listPublicItemsWithStock, // New function for enhanced stock info
  testDatabase,
  testImageServing,
  getItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Multer config: 1MB max per file, max 4 images
const upload = multer({
  dest: "uploads/tmp",
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
    files: 4,
  },
});

// ═══════════════════════════════════════════════════════════
// 🧪 TEST ENDPOINTS (No Authentication Required)
// ═══════════════════════════════════════════════════════════

// Test database connection and get sample data
router.get("/test", testDatabase);

// Test image serving and file structure
router.get("/test-images", testImageServing);

// ═══════════════════════════════════════════════════════════
// 🌍 PUBLIC ENDPOINTS (No Authentication Required)
// ═══════════════════════════════════════════════════════════

// Get ALL public items (for your products page)
router.get("/public", listPublicItems);

// Get ALL public items with enhanced stock information
router.get("/public/with-stock", listPublicItemsWithStock);

// ═══════════════════════════════════════════════════════════
// 🔒 ADMIN ENDPOINTS (Authentication Required)
// ═══════════════════════════════════════════════════════════

// Create new item (Admin only)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.array("images", 4),
  createItem
);

// List all items for admin management (Admin only)
router.get(
  "/",
  authenticate,
  authorize("admin"),
  listItems
);

// Get single item by ID (Admin only)
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getItem
);

// Update existing item (Admin only)
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.array("images", 4),
  updateItem
);

// Delete item (Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteItem
);

export default router;