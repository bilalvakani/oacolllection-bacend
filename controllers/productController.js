const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get product by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, slug, img, images, cat, price, old, sku, desc, colors } = req.body;
    const product = new Product({
      name,
      slug,
      img,
      images: images || [],
      cat,
      price,
      old,
      sku,
      desc,
      colors,
      rating: 5.0,
      reviews: 0
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { name, img, images, cat, price, old, sku, desc, colors } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name ?? product.name;
    product.slug = name ? name.toLowerCase().replace(/ /g, '-') : product.slug;
    product.img = img ?? product.img;
    product.images = images ?? product.images;
    product.cat = cat ?? product.cat;
    product.price = price ?? product.price;
    product.old = old ?? product.old;
    product.sku = sku ?? product.sku;
    product.desc = desc ?? product.desc;
    product.colors = colors ?? product.colors;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
