const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// File upload configuration for artwork
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// In-Memory / Database Store
let orders = [];

// Artwork File Upload Endpoint
app.post('/api/upload-artwork', upload.single('artwork'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({ success: true, filePath: req.file.path, fileName: req.file.filename });
});

// Create Order Endpoint
app.post('/api/orders', (req, res) => {
  const newOrder = {
    orderId: `CP-${Date.now().toString().slice(-6)}`,
    ...req.body,
    status: 'Order Received',
    createdAt: new Date()
  };
  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// Fetch Orders (Admin)
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Update Status (Admin)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.orderId === id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = status;
  res.json(order);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Chandra Printers Server running on port ${PORT}`));