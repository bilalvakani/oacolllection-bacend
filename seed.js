const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const products = [
  { 
    slug: "gul-ahmed-embroidered-3-piece",
    img: "/src/assets/p-gul-ahmed.png", 
    name: "Gul Ahmed Embroidered 3-Piece", 
    cat: "3 Piece", 
    price: 8500, 
    old: 12000, 
    rating: 4.9, 
    badge: "New Arrival",
    reviews: 246,
    sku: "OA-GA-3P-001",
    desc: "Exquisite 3-piece embroidered suit from Gul Ahmed. Features a beautifully crafted lawn shirt, matching trousers, and a digitally printed dupatta.",
    colors: ["#FFFFFF", "#F5F5DC", "#FFD700"]
  },
  { 
    slug: "nishat-linen-floral-3-piece",
    img: "/src/assets/p-nishat.png", 
    name: "Nishat Linen Floral 3-Piece", 
    cat: "3 Piece", 
    price: 7500, 
    old: 11000, 
    rating: 5.0, 
    badge: "Sale",
    reviews: 182,
    sku: "OA-NL-3P-002",
    desc: "A stunning floral collection from Nishat Linen. Soft lawn fabric with vibrant prints, perfect for summer elegance.",
    colors: ["#E6E6FA", "#F0FFF0", "#FFF0F5"]
  },
  { 
    slug: "khaadi-ready-to-wear-pret",
    img: "/src/assets/cat-pret.png", 
    name: "Khaadi Ready-to-Wear Pret", 
    cat: "Pret", 
    price: 6000, 
    old: 9000, 
    rating: 4.8, 
    badge: "Popular",
    reviews: 310,
    sku: "OA-KH-PR-003",
    desc: "Chic and modern ready-to-wear kurta from Khaadi. Breathable cotton fabric with contemporary ethnic designs.",
    colors: ["#1a1a1a", "#8B4513", "#2563eb"]
  },
  { 
    slug: "j-luxury-unstitched-fabric",
    img: "/src/assets/cat-unstitched.png", 
    name: "J. Luxury Unstitched Fabric", 
    cat: "Unstitched", 
    price: 5500, 
    old: 8000, 
    rating: 4.7, 
    badge: "",
    reviews: 125,
    sku: "OA-J-UN-004",
    desc: "Premium quality unstitched fabric from J. (Junaid Jamshed). Ideal for custom tailoring your perfect outfit.",
    colors: ["#FFFFFF", "#C0C0C0", "#000000"]
  },
  { 
    slug: "maria-b-silk-collection",
    img: "/src/assets/p-gul-ahmed.png", 
    name: "Maria B. Silk Collection", 
    cat: "Formal", 
    price: 15000, 
    old: 20000, 
    rating: 5.0, 
    badge: "Premium",
    reviews: 95,
    sku: "OA-MB-FL-005",
    desc: "Luxury silk collection by Maria B. Features heavy embroidery and premium finish for festive occasions.",
    colors: ["#800000", "#4B0082", "#006400"]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    
    // Add Products
    await Product.insertMany(products);
    console.log('Products seeded!');
    
    // Add Admin User
    const admin = new User({
      firstName: 'OA',
      lastName: 'Admin',
      email: 'admin@oacollection.com',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created! (Email: admin@oacollection.com, Pass: admin123)');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
