import path from "node:path";
import fs from "node:fs/promises";
import Joi from "joi";
import { db } from "../config/db.js";

const imgDir = (id) => path.join("uploads/items", String(id));

// Updated absURL function with environment variable support
const absURL = (req, id, file) => {
  // Use environment variable for production, fallback to request host for development
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/items/${id}/${file}`;
};

const baseSchema = {
  category: Joi.string().max(60).required(),
  name: Joi.string().max(120).required(),
  description: Joi.string().allow(""),
  detail: Joi.string().allow(""),
  price: Joi.number().positive().required(),
  discount: Joi.boolean().default(false),
  discount_amount: Joi.number().positive().allow("", null).optional(),
  discount_reason: Joi.string().allow("", null).optional(),
  suspended: Joi.boolean().default(false),
  stock_update: Joi.boolean().default(true),
  share_link: Joi.string().allow("", null).optional(),
  // Allow image field but ignore it (frontend might send it)
  image: Joi.any().optional(),
  images: Joi.any().optional(),
};

export const createItem = async (req, res) => {
  try {
    console.log('🔄 Starting createItem...');
    console.log('📁 Files received:', req.files?.length || 0);
    console.log('📝 Body data:', req.body);

    const contentType = req.headers["content-type"] || "";
    const rawData = { ...req.body };

    // Convert all boolean fields regardless of content type
    // Handle discount field - convert various formats to boolean
    if (rawData.discount === "true" || rawData.discount === "1" || rawData.discount === 1 || rawData.discount === true) {
      rawData.discount = true;
    } else {
      rawData.discount = false;
    }
    
    // Handle suspended field
    if (rawData.suspended === "true" || rawData.suspended === "1" || rawData.suspended === 1 || rawData.suspended === true) {
      rawData.suspended = true;
    } else {
      rawData.suspended = false;
    }
    
    // Handle stock_update field
    if (rawData.stock_update === "true" || rawData.stock_update === "1" || rawData.stock_update === 1 || rawData.stock_update === true) {
      rawData.stock_update = true;
    } else {
      rawData.stock_update = false;
    }
    
    // Convert price to number
    rawData.price = parseFloat(rawData.price);
    
    // Handle discount_amount - convert empty strings to null
    if (rawData.discount_amount === "" || rawData.discount_amount === "null" || rawData.discount_amount === undefined || rawData.discount_amount === null) {
      rawData.discount_amount = null;
    } else if (rawData.discount_amount) {
      rawData.discount_amount = parseFloat(rawData.discount_amount);
    }
    
    // Remove any image-related fields that might come from frontend
    delete rawData.image;
    delete rawData.images;

    console.log('📝 Processed data for validation:', {
      ...rawData,
      discount_type: typeof rawData.discount,
      suspended_type: typeof rawData.suspended,
      stock_update_type: typeof rawData.stock_update,
      price_type: typeof rawData.price
    });

    // Validate data
    const { error, value } = Joi.object(baseSchema).validate(rawData);
    if (error) {
      console.log('❌ Validation error:', error.message);
      return res.status(400).json({ message: error.message });
    }

    const {
      category, name, description, detail, price,
      discount, discount_amount, discount_reason,
      suspended, stock_update
    } = value;

    // Insert item into database
    console.log('💾 Inserting item into database...');
    const [result] = await db.query(
      `INSERT INTO items
         (category, name, description, detail, price,
          discount, discount_amount, discount_reason, suspended, stock_update)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category, name, description, detail, price,
        discount ? 1 : 0,
        discount ? discount_amount : null,
        discount ? discount_reason : null,
        suspended ? 1 : 0,
        stock_update ? 1 : 0,
      ]
    );
    
    const itemId = result.insertId;
    console.log(`✅ Item created with ID: ${itemId}`);

    // Handle image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      console.log(`🖼️ Processing ${req.files.length} images...`);
      
      // Create directory for this item
      const itemDir = imgDir(itemId);
      await fs.mkdir(itemDir, { recursive: true });
      console.log(`📁 Created directory: ${itemDir}`);

      // Process each file
      for (let idx = 0; idx < req.files.length; idx++) {
        const file = req.files[idx];
        console.log(`🔄 Processing file ${idx + 1}:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          tempPath: file.path
        });

        try {
          // Generate filename with proper extension
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const fileName = `${idx + 1}${fileExtension}`;
          const finalPath = path.join(itemDir, fileName);

          // Move file from temp location to final location
          await fs.rename(file.path, finalPath);
          console.log(`📁 Moved file to: ${finalPath}`);

          // Verify file exists
          await fs.access(finalPath);
          console.log(`✅ File exists at: ${finalPath}`);

          // Insert into database
          const [imageResult] = await db.query(
            "INSERT INTO item_images (item_id, file_name) VALUES (?, ?)",
            [itemId, fileName]
          );
          console.log(`💾 Image record created with ID: ${imageResult.insertId}`);

          // Generate URL
          const imageUrl = absURL(req, itemId, fileName);
          images.push(imageUrl);
          console.log(`🔗 Image URL: ${imageUrl}`);

        } catch (fileError) {
          console.error(`❌ Error processing file ${idx + 1}:`, fileError);
          // Continue with other files instead of failing completely
        }
      }
    } else {
      console.log('ℹ️ No files to process');
    }

    // Update share link using BASE_URL
    const shareBaseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:3000";
    const share = `${shareBaseUrl}/item/${itemId}`;
    await db.query("UPDATE items SET share_link=? WHERE id=?", [share, itemId]);
    console.log(`🔗 Share link updated: ${share}`);

    console.log(`✅ Item creation completed. Images: ${images.length}`);
    res.status(201).json({ 
      itemId, 
      share, 
      images,
      message: `Item created successfully with ${images.length} images`
    });

  } catch (error) {
    console.error('❌ Error in createItem:', error);
    res.status(500).json({ 
      message: 'Failed to create item', 
      error: error.message 
    });
  }
};

export const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔄 Starting updateItem for ID: ${id}`);
    
    const contentType = req.headers["content-type"] || "";
    const rawData = { ...req.body };

    // Handle multipart form data conversions
    if (contentType.startsWith("multipart/form-data")) {
      rawData.discount = rawData.discount === "true";
      rawData.suspended = rawData.suspended === "true";
      rawData.stock_update = rawData.stock_update === "true";
      rawData.price = parseFloat(rawData.price);
      
      // Handle discount_amount - convert empty strings to null
      if (rawData.discount_amount === "" || rawData.discount_amount === "null" || rawData.discount_amount === undefined) {
        rawData.discount_amount = null;
      } else if (rawData.discount_amount) {
        rawData.discount_amount = parseFloat(rawData.discount_amount);
      }
      
      // Remove any image-related fields that might come from frontend
      delete rawData.image;
      delete rawData.images;
    }

    console.log('📝 Processed data for validation:', rawData);

    // Validate data
    const { error, value } = Joi.object(baseSchema).validate(rawData);
    if (error) {
      console.log('❌ Validation error:', error.message);
      return res.status(400).json({ message: error.message });
    }

    const {
      category, name, description, detail, price,
      discount, discount_amount, discount_reason,
      suspended, stock_update, share_link
    } = value;

    // Update item in database
    console.log('💾 Updating item in database...');
    const [updateResult] = await db.query(
      `UPDATE items SET
         category=?, name=?, description=?, detail=?, price=?,
         discount=?, discount_amount=?, discount_reason=?, suspended=?, stock_update=?, share_link=?
       WHERE id=?`,
      [
        category, name, description, detail, price,
        discount ? 1 : 0,
        discount ? discount_amount : null,
        discount ? discount_reason : null,
        suspended ? 1 : 0,
        stock_update ? 1 : 0,
        share_link,
        id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Handle new images if provided
    let newImages = [];
    if (req.files && req.files.length > 0) {
      console.log(`🖼️ Replacing images with ${req.files.length} new images...`);
      
      // Remove old images from filesystem and database
      try {
        await fs.rm(imgDir(id), { recursive: true, force: true });
        console.log('🗑️ Removed old image directory');
      } catch (err) {
        console.log('ℹ️ No old image directory to remove');
      }
      
      await db.query("DELETE FROM item_images WHERE item_id=?", [id]);
      console.log('🗑️ Removed old image records from database');

      // Create new directory and process new images
      const itemDir = imgDir(id);
      await fs.mkdir(itemDir, { recursive: true });
      console.log(`📁 Created new directory: ${itemDir}`);

      for (let idx = 0; idx < req.files.length; idx++) {
        const file = req.files[idx];
        console.log(`🔄 Processing new file ${idx + 1}:`, file.originalname);

        try {
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const fileName = `${idx + 1}${fileExtension}`;
          const finalPath = path.join(itemDir, fileName);

          await fs.rename(file.path, finalPath);
          await fs.access(finalPath); // Verify file exists

          const [imageResult] = await db.query(
            "INSERT INTO item_images (item_id, file_name) VALUES (?, ?)",
            [id, fileName]
          );
          
          const imageUrl = absURL(req, id, fileName);
          newImages.push(imageUrl);
          console.log(`✅ New image processed: ${imageUrl}`);

        } catch (fileError) {
          console.error(`❌ Error processing new file ${idx + 1}:`, fileError);
        }
      }
    }

    console.log(`✅ Item update completed. New images: ${newImages.length}`);
    res.json({ 
      message: "Updated successfully",
      newImages: newImages.length > 0 ? newImages : undefined
    });

  } catch (error) {
    console.error('❌ Error in updateItem:', error);
    res.status(500).json({ 
      message: 'Failed to update item', 
      error: error.message 
    });
  }
};

export const listItems = async (req, res) => {
  try {
    console.log('🔄 Starting listItems...');
    
    const [rows] = await db.query(`
      SELECT  i.id,
              i.category,
              i.name,
              i.price,
              i.suspended,
              MIN(img.file_name) AS file_name
      FROM items i
      LEFT JOIN item_images img ON img.item_id = i.id
      GROUP BY i.id, i.category, i.name, i.price, i.suspended
      ORDER BY i.created_at DESC
    `);

    console.log(`📊 Found ${rows.length} items`);

    // Use environment variable for base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const items = rows.map(r => ({
      ...r,
      image: r.file_name
        ? `${baseUrl}/uploads/items/${r.id}/${r.file_name}`
        : null,
    }));

    res.json(items);
    
  } catch (error) {
    console.error('❌ Error in listItems:', error);
    res.status(500).json({ 
      message: 'Failed to fetch items', 
      error: error.message 
    });
  }
};

export const getItem = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔄 Getting item ${id}...`);
    
    const [rows] = await db.query("SELECT * FROM items WHERE id=?", [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const [imgRows] = await db.query(
      "SELECT file_name FROM item_images WHERE item_id=? ORDER BY id", [id]
    );
    
    const images = imgRows.map(r => absURL(req, id, r.file_name));
    console.log(`🖼️ Found ${images.length} images for item ${id}`);

    res.json({ 
      ...rows[0], 
      images,
      image: images.length > 0 ? images[0] : null
    });
    
  } catch (error) {
    console.error('❌ Error in getItem:', error);
    res.status(500).json({ 
      message: 'Failed to fetch item', 
      error: error.message 
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🔄 Deleting item ${id}...`);
    
    const [out] = await db.query("DELETE FROM items WHERE id=?", [id]);
    if (!out.affectedRows) {
      return res.status(404).json({ message: "Not found" });
    }

    // Clean up images
    try {
      await fs.rm(imgDir(id), { recursive: true, force: true });
      console.log('🗑️ Removed image directory');
    } catch (err) {
      console.log('ℹ️ No image directory to remove');
    }

    console.log(`✅ Item ${id} deleted successfully`);
    res.json({ message: "Deleted" });
    
  } catch (error) {
    console.error('❌ Error in deleteItem:', error);
    res.status(500).json({ 
      message: 'Failed to delete item', 
      error: error.message 
    });
  }
};

export const listPublicItems = async (req, res) => {
  try {
    console.log('🔄 Starting listPublicItems - fetching ALL items...');
    
    // Get ALL items with their images (removed LIMIT 12)
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.category,
        i.name,
        i.description,
        i.detail,
        i.price,
        i.discount,
        i.discount_amount,
        i.discount_reason,
        i.suspended,
        i.share_link,
        i.created_at,
        GROUP_CONCAT(img.file_name ORDER BY img.id SEPARATOR ',') AS image_files
      FROM items i
      LEFT JOIN item_images img ON img.item_id = i.id
      WHERE i.suspended = 0
      GROUP BY i.id, i.category, i.name, i.description, i.detail, i.price, 
               i.discount, i.discount_amount, i.discount_reason, i.suspended, 
               i.share_link, i.created_at
      ORDER BY i.created_at DESC
    `);

    console.log(`📊 Found ${rows.length} public items in database (showing ALL items)`);

    // Use environment variable for base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    console.log(`🌐 Base URL: ${baseUrl}`);
    
    const items = rows.map(r => {
      // Process images
      const imageFiles = r.image_files ? r.image_files.split(',').filter(f => f.trim()) : [];
      const images = imageFiles.map(fileName => {
        const imageUrl = `${baseUrl}/uploads/items/${r.id}/${fileName.trim()}`;
        return imageUrl;
      });
      
      console.log(`📦 Item ${r.id} (${r.name}):`, {
        category: r.category,
        price: r.price,
        image_count: images.length,
        has_discount: Boolean(r.discount),
        first_image_url: images[0] || null
      });
      
      return {
        id: r.id,
        category: r.category,
        name: r.name,
        description: r.description,
        detail: r.detail,
        price: parseFloat(r.price),
        discount: Boolean(r.discount),
        discount_amount: r.discount_amount ? parseFloat(r.discount_amount) : null,
        discount_reason: r.discount_reason,
        suspended: Boolean(r.suspended),
        share_link: r.share_link,
        created_at: r.created_at,
        // Main image (first image)
        image: images.length > 0 ? images[0] : null,
        // All images
        images: images,
        // Add stock information (you can enhance this based on your stock table)
        stock_quantity: Math.floor(Math.random() * 50) + 1, // Mock data - replace with real stock query
        in_stock: true // You can determine this based on stock_quantity > 0
      };
    });

    console.log(`✅ Sending ${items.length} items to frontend`);
    console.log(`📈 Categories found: ${[...new Set(items.map(i => i.category))].join(', ')}`);
    console.log(`💰 Price range: KSh ${Math.min(...items.map(i => i.price)).toLocaleString()} - KSh ${Math.max(...items.map(i => i.price)).toLocaleString()}`);
    
    // Log sample image URLs for debugging
    const sampleItem = items[0];
    if (sampleItem) {
      console.log(`🔍 Sample image URL for debugging: ${sampleItem.image}`);
    }
    
    res.json(items);
    
  } catch (error) {
    console.error('❌ Error in listPublicItems:', error);
    res.status(500).json({ 
      message: 'Failed to fetch items',
      error: error.message 
    });
  }
};

export const listPublicItemsWithStock = async (req, res) => {
  try {
    console.log('🔄 Starting listPublicItemsWithStock - fetching ALL items with stock...');
    
    // Enhanced query with stock information
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.category,
        i.name,
        i.description,
        i.detail,
        i.price,
        i.discount,
        i.discount_amount,
        i.discount_reason,
        i.suspended,
        i.share_link,
        i.stock_update,
        i.created_at,
        GROUP_CONCAT(img.file_name ORDER BY img.id SEPARATOR ',') AS image_files,
        COALESCE(s.quantity, 0) as stock_quantity
      FROM items i
      LEFT JOIN item_images img ON img.item_id = i.id
      LEFT JOIN stock s ON s.item_id = i.id
      WHERE i.suspended = 0
      GROUP BY i.id, i.category, i.name, i.description, i.detail, i.price, 
               i.discount, i.discount_amount, i.discount_reason, i.suspended, 
               i.share_link, i.stock_update, i.created_at, s.quantity
      ORDER BY i.created_at DESC
    `);

    console.log(`📊 Found ${rows.length} public items with stock information`);

    // Use environment variable for base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    
    const items = rows.map(r => {
      const imageFiles = r.image_files ? r.image_files.split(',').filter(f => f.trim()) : [];
      const images = imageFiles.map(fileName => `${baseUrl}/uploads/items/${r.id}/${fileName.trim()}`);
      
      const stockQuantity = parseInt(r.stock_quantity) || 0;
      
      return {
        id: r.id,
        category: r.category,
        name: r.name,
        description: r.description,
        detail: r.detail,
        price: parseFloat(r.price),
        discount: Boolean(r.discount),
        discount_amount: r.discount_amount ? parseFloat(r.discount_amount) : null,
        discount_reason: r.discount_reason,
        suspended: Boolean(r.suspended),
        share_link: r.share_link,
        created_at: r.created_at,
        image: images.length > 0 ? images[0] : null,
        images: images,
        stock_quantity: stockQuantity,
        in_stock: stockQuantity > 0,
        stock_status: stockQuantity > 10 ? 'in_stock' : stockQuantity > 0 ? 'low_stock' : 'out_of_stock'
      };
    });

    console.log(`✅ Sending ${items.length} items with stock to frontend`);
    
    res.json(items);
    
  } catch (error) {
    console.error('❌ Error in listPublicItemsWithStock:', error);
    res.status(500).json({ 
      message: 'Failed to fetch items with stock',
      error: error.message 
    });
  }
};

export const testImageServing = async (req, res) => {
  try {
    // Use environment variable for base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    
    // Check if uploads directory exists
    const uploadsPath = path.join(process.cwd(), 'uploads', 'items');
    
    let uploadsDirExists = false;
    try {
      await fs.access(uploadsPath);
      uploadsDirExists = true;
      console.log('✅ Uploads directory exists');
    } catch {
      console.log('❌ Uploads directory does not exist');
    }
    
    if (!uploadsDirExists) {
      return res.json({
        error: 'Uploads directory not found',
        expected_path: uploadsPath,
        suggestion: 'Create the uploads/items directory and add some images'
      });
    }
    
    // Get actual files in uploads directory
    const itemDirs = await fs.readdir(uploadsPath);
    console.log('📁 Item directories found:', itemDirs);
    
    const fileStructure = {};
    for (const itemDir of itemDirs) {
      const itemPath = path.join(uploadsPath, itemDir);
      try {
        const stat = await fs.stat(itemPath);
        if (stat.isDirectory()) {
          const files = await fs.readdir(itemPath);
          fileStructure[itemDir] = files.map(file => ({
            filename: file,
            url: `${baseUrl}/uploads/items/${itemDir}/${file}`,
            path: path.join(itemPath, file)
          }));
        }
      } catch (err) {
        fileStructure[itemDir] = `Error reading directory: ${err.message}`;
      }
    }
    
    res.json({
      message: 'Image serving test',
      base_url: baseUrl,
      uploads_path: uploadsPath,
      uploads_exists: uploadsDirExists,
      file_structure: fileStructure,
      test_urls: Object.keys(fileStructure).length > 0 
        ? Object.values(fileStructure)[0]?.map?.(f => f.url) || []
        : [],
      recommendations: Object.keys(fileStructure).length === 0 
        ? ['No image directories found', 'Upload some products with images via admin panel']
        : ['Images found', 'Test URLs by opening them in browser'],
      environment_info: {
        BASE_URL: process.env.BASE_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
};

export const testDatabase = async (req, res) => {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const [healthCheck] = await db.query('SELECT 1 as healthy');
    
    // Count items
    const [itemCount] = await db.query('SELECT COUNT(*) as count FROM items');
    
    // Count images
    const [imageCount] = await db.query('SELECT COUNT(*) as count FROM item_images');
    
    // Get detailed sample items with image info
    const [sampleItems] = await db.query(`
      SELECT 
        i.id, 
        i.name, 
        i.category, 
        i.suspended,
        COUNT(img.id) as image_count,
        GROUP_CONCAT(img.file_name ORDER BY img.id) as image_files
      FROM items i 
      LEFT JOIN item_images img ON i.id = img.item_id 
      GROUP BY i.id, i.name, i.category, i.suspended
      ORDER BY i.created_at DESC
      LIMIT 5
    `);
    
    // Use environment variable for base URL
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    
    res.json({
      message: 'Database connection successful',
      healthy: healthCheck[0].healthy === 1,
      stats: {
        total_items: itemCount[0].count,
        total_images: imageCount[0].count,
        non_suspended_items: sampleItems.filter(item => !item.suspended).length
      },
      base_url: baseUrl,
      upload_path: `${baseUrl}/uploads/items/`,
      sample_items: sampleItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        suspended: Boolean(item.suspended),
        image_count: parseInt(item.image_count),
        image_files: item.image_files ? item.image_files.split(',') : [],
        sample_image_url: item.image_files ? 
          `${baseUrl}/uploads/items/${item.id}/${item.image_files.split(',')[0]}` : null,
        all_image_urls: item.image_files ? 
          item.image_files.split(',').map(f => `${baseUrl}/uploads/items/${item.id}/${f}`) : []
      })),
      debug_queries: {
        check_specific_item: `SELECT * FROM items WHERE id = 7`,
        check_item_images: `SELECT * FROM item_images WHERE item_id = 7`,
        check_all_images: `SELECT i.name, img.* FROM items i LEFT JOIN item_images img ON i.id = img.item_id ORDER BY i.id`
      },
      environment_info: {
        BASE_URL: process.env.BASE_URL || 'Not set',
        FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV || 'Not set'
      }
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({
      message: 'Database test failed',
      error: error.message
    });
  }
};