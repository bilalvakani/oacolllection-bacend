const mongoose = require('mongoose');

const sizeStockSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "S", "M", "L", "XL"
  stock: { type: Number, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  img: { type: String, required: true },
  images: [{ type: String }],
  cat: { type: String, required: true },
  price: { type: Number, required: true },
  old: { type: Number },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  badge: { type: String },
  sku: { type: String },
  desc: { type: String },
  colors: [String],
  sizes: [sizeStockSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
