const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const createDefaultUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickcart');
    console.log('Connected to MongoDB');

    // Check if default user exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) {
      console.log('Default user already exists');
      return existingUser._id;
    }

    // Create default user
    const user = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'seller'
    });

    const savedUser = await user.save();
    console.log('Created default user:', savedUser._id);
    return savedUser._id;
  } catch (error) {
    console.error('Error creating default user:', error);
    process.exit(1);
  }
};

const seedProducts = async (userId) => {
  const products = [
    {
      name: "Apple AirPods Pro 2nd gen",
      description: "Apple AirPods Pro (2nd Gen) with MagSafe Case (USB-C) provide excellent sound, active noise cancellation, and a comfortable fit. The USB-C case ensures quick charging, and they pair seamlessly with Apple devices for an effortless audio experience.",
      price: 499.99,
      offerPrice: 399.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/k4dafzhwhgcn5tnoylrw.webp",
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/j212frakb8hdrhvhajhg.webp",
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/imwuugqxsajuwqpkegb5.webp",
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/k1oqaslw5tb3ebw01vvj.webp"
      ],
      category: "Earphone",
      userId: userId
    },
    {
      name: "Bose QuietComfort 45",
      description: "The Bose QuietComfort 45 headphones are engineered for exceptional sound quality and unparalleled noise cancellation. With a 24-hour battery life and comfortable, lightweight design, these headphones deliver premium audio for any environment. Whether on a flight, in the office, or at home, the Bose QC45 blocks out distractions, offering an immersive listening experience.",
      price: 429.99,
      offerPrice: 329.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/m16coelz8ivkk9f0nwrz.webp"
      ],
      category: "Headphone",
      userId: userId
    },
    {
      name: "Samsung Galaxy S23",
      description: "The Samsung Galaxy S23 offers an all-encompassing mobile experience with its advanced AMOLED display, offering vibrant visuals and smooth interactions. Equipped with top-of-the-line fitness tracking features and cutting-edge technology, this phone delivers outstanding performance. With powerful hardware, a sleek design, and long battery life, the S23 is perfect for those who demand the best in mobile innovation.",
      price: 899.99,
      offerPrice: 799.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/xjd4eprpwqs7odbera1w.webp"
      ],
      category: "Smartphone",
      userId: userId
    },
    {
      name: "Garmin Venu 2",
      description: "The Garmin Venu 2 smartwatch blends advanced fitness tracking with sophisticated design, offering a wealth of features such as heart rate monitoring, GPS, and sleep tracking. Built with a 24-hour battery life, this watch is ideal for fitness enthusiasts and anyone looking to enhance their daily lifestyle. With a stunning AMOLED display and customizable watch faces, the Venu 2 combines technology with style seamlessly.",
      price: 399.99,
      offerPrice: 349.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/hdfi4u3fmprazpnrnaga.webp"
      ],
      category: "Watch",
      userId: userId
    },
    {
      name: "PlayStation 5",
      description: "The PlayStation 5 takes gaming to the next level with ultra-HD graphics, a powerful 825GB SSD, and ray tracing technology for realistic visuals. Whether you're into high-action games or immersive storytelling, the PS5 delivers fast loading times, seamless gameplay, and stunning visuals. It's a must-have for any serious gamer looking for the ultimate gaming experience.",
      price: 599.99,
      offerPrice: 499.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/dd3l13vfoartrgbvkkh5.webp"
      ],
      category: "Accessories",
      userId: userId
    },
    {
      name: "Canon EOS R5",
      description: "The Canon EOS R5 is a game-changing mirrorless camera with a 45MP full-frame sensor, offering ultra-high resolution and the ability to shoot 8K video. Whether you're capturing professional-quality stills or cinematic video footage, this camera delivers exceptional clarity, speed, and color accuracy. With advanced autofocus and in-body stabilization, the R5 is ideal for photographers and videographers alike.",
      price: 4199.99,
      offerPrice: 3899.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/r5h370zuujvrw461c6wy.webp"
      ],
      category: "Camera",
      userId: userId
    },
    {
      name: "MacBook Pro 16",
      description: "The MacBook Pro 16, powered by Apple's M2 Pro chip, offers outstanding performance with 16GB RAM and a 512GB SSD. Whether you're editing high-resolution video, developing software, or multitasking with ease, this laptop can handle the toughest tasks. It features a stunning Retina display with True Tone technology, making it a top choice for professionals in creative industries or anyone who demands premium performance in a portable form.",
      price: 2799.99,
      offerPrice: 2499.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/rzri7kytphxalrm9rubd.webp"
      ],
      category: "Laptop",
      userId: userId
    },
    {
      name: "Sony WF-1000XM5",
      description: "Sony WF-1000XM5 true wireless earbuds deliver immersive sound with Hi-Res Audio and advanced noise cancellation technology. Designed for comfort and quality, they provide a stable, snug fit for a secure listening experience. Whether you're working out or traveling, these earbuds will keep you connected with the world around you while enjoying rich, clear sound.",
      price: 349.99,
      offerPrice: 299.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/e3zjaupyumdkladmytke.webp"
      ],
      category: "Earphone",
      userId: userId
    },
    {
      name: "Samsung Projector 4k",
      description: "The Samsung 4K Projector offers an immersive cinematic experience with ultra-high-definition visuals and realistic color accuracy. Equipped with a built-in speaker, it delivers rich sound quality to complement its stunning 4K resolution. Perfect for movie nights, gaming, or presentations, this projector is the ultimate choice for creating an at-home theater experience or professional setting.",
      price: 1699.99,
      offerPrice: 1499.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/qqdcly8a8vkyciy9g0bw.webp"
      ],
      category: "Accessories",
      userId: userId
    },
    {
      name: "ASUS ROG Zephyrus G16",
      description: "The ASUS ROG Zephyrus G16 gaming laptop is powered by the Intel Core i9 processor and features an RTX 4070 GPU, delivering top-tier gaming and performance. With 16GB of RAM and a 1TB SSD, this laptop is designed for gamers who demand extreme power, speed, and storage. Equipped with a stunning 16-inch display, it's built to handle the most demanding titles and applications with ease.",
      price: 2199.99,
      offerPrice: 1999.99,
      images: [
        "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/wig1urqgnkeyp4t2rtso.webp"
      ],
      category: "Laptop",
      userId: userId
    }
  ];

  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`Inserted ${createdProducts.length} products`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Main execution
const runSeeder = async () => {
  try {
    const userId = await createDefaultUser();
    await seedProducts(userId);
  } catch (error) {
    console.error('Seeder failed:', error);
    process.exit(1);
  }
};

runSeeder();