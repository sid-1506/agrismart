require("dotenv").config();
const mongoose = require("mongoose");
const Crop = require("./models/Crop");

const crops = [
  {
    name: "Wheat",
    season: "Rabi",
    category: "Cereal",
    duration: "120-150 days",
    regions: ["Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan"],
    conditions: { soil: "Loamy, well-drained", temperature: "10-25°C", rainfall: "250-500mm", humidity: "60-70%" },
    description: "Wheat is India's most important rabi crop, grown across northern plains. Rich in carbohydrates and protein, it forms the backbone of India's food security.",
    image: "",
  },
  {
    name: "Soybean",
    season: "Kharif",
    category: "Oilseed",
    duration: "90-120 days",
    regions: ["Maharashtra", "Madhya Pradesh", "Rajasthan", "Karnataka"],
    conditions: { soil: "Well-drained loamy", temperature: "25-30°C", rainfall: "600-800mm", humidity: "65-75%" },
    description: "Soybean is a major oilseed and protein crop highly profitable in Kharif season. It enriches soil nitrogen and is used in food, feed, and industrial products.",
    image: "",
  },
  {
    name: "Cotton",
    season: "Kharif",
    category: "Cash Crop",
    duration: "150-180 days",
    regions: ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Punjab"],
    conditions: { soil: "Black cotton soil, deep loamy", temperature: "21-35°C", rainfall: "500-700mm", humidity: "55-65%" },
    description: "Cotton is India's white gold — a major cash crop supporting millions of farmers across the Deccan plateau and western India.",
    image: "",
  },
  {
    name: "Rice",
    season: "Kharif",
    category: "Cereal",
    duration: "100-130 days",
    regions: ["West Bengal", "Odisha", "Tamil Nadu", "Andhra Pradesh", "Assam"],
    conditions: { soil: "Clayey, water retentive", temperature: "20-35°C", rainfall: "1000-2000mm", humidity: "70-80%" },
    description: "Rice is the staple food of over half of India's population, grown in flooded paddy fields across coastal and eastern regions.",
    image: "",
  },
  {
    name: "Tomato",
    season: "All Season",
    category: "Vegetable",
    duration: "60-90 days",
    regions: ["Maharashtra", "Karnataka", "Andhra Pradesh", "Himachal Pradesh", "Uttar Pradesh"],
    conditions: { soil: "Sandy loam, well-drained", temperature: "18-27°C", rainfall: "400-600mm", humidity: "60-70%" },
    description: "Tomato is a high-value vegetable crop cultivated year-round across India. It's the second most important vegetable after potato and commands strong market prices.",
    image: "",
  },
  {
    name: "Mustard",
    season: "Rabi",
    category: "Oilseed",
    duration: "90-110 days",
    regions: ["Rajasthan", "Uttar Pradesh", "Haryana", "Madhya Pradesh", "West Bengal"],
    conditions: { soil: "Sandy loam to loam", temperature: "10-25°C", rainfall: "250-400mm", humidity: "55-65%" },
    description: "Mustard is India's second most important oilseed crop, thriving in cool dry winters. It's drought-tolerant and fits well in crop rotation systems.",
    image: "",
  },
  {
    name: "Sugarcane",
    season: "All Season",
    category: "Cash Crop",
    duration: "300-365 days",
    regions: ["Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh"],
    conditions: { soil: "Deep loamy, well-drained", temperature: "20-35°C", rainfall: "1000-1500mm", humidity: "65-80%" },
    description: "Sugarcane is India's most important commercial crop, forming the backbone of the sugar industry and providing raw material for ethanol production.",
    image: "",
  },
  {
    name: "Maize",
    season: "Kharif",
    category: "Cereal",
    duration: "80-110 days",
    regions: ["Karnataka", "Madhya Pradesh", "Bihar", "Rajasthan", "Andhra Pradesh"],
    conditions: { soil: "Well-drained loamy", temperature: "20-30°C", rainfall: "500-900mm", humidity: "60-70%" },
    description: "Maize is a versatile crop used as food, fodder, starch, and industrial raw material. India is among the world's top 10 producers.",
    image: "",
  },
  {
    name: "Chickpea",
    season: "Rabi",
    category: "Pulse",
    duration: "90-120 days",
    regions: ["Madhya Pradesh", "Rajasthan", "Maharashtra", "Uttar Pradesh", "Karnataka"],
    conditions: { soil: "Sandy loam to medium black", temperature: "15-25°C", rainfall: "250-400mm", humidity: "50-60%" },
    description: "Chickpea (Chana) is India's most important pulse crop, grown extensively in central and northern India. It fixes atmospheric nitrogen and improves soil health.",
    image: "",
  },
  {
    name: "Banana",
    season: "All Season",
    category: "Fruit",
    duration: "300-400 days",
    regions: ["Tamil Nadu", "Maharashtra", "Gujarat", "Andhra Pradesh", "Karnataka"],
    conditions: { soil: "Rich loamy, moisture-retentive", temperature: "20-35°C", rainfall: "1200-2200mm", humidity: "70-85%" },
    description: "Banana is India's largest produced fruit and one of the most profitable horticultural crops, grown in tropical and sub-tropical regions year-round.",
    image: "",
  },
  {
    name: "Mango",
    season: "Zaid",
    category: "Fruit",
    duration: "365+ days",
    regions: ["Uttar Pradesh", "Maharashtra", "Andhra Pradesh", "Gujarat", "Karnataka"],
    conditions: { soil: "Deep alluvial or sandy loam", temperature: "24-27°C", rainfall: "750-1200mm", humidity: "55-70%" },
    description: "India is the world's largest mango producer. Known as the king of fruits, it has over 1000 varieties and is a major export crop generating significant foreign exchange.",
    image: "",
  },
  {
    name: "Onion",
    season: "Rabi",
    category: "Vegetable",
    duration: "100-120 days",
    regions: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Gujarat", "Rajasthan"],
    conditions: { soil: "Sandy loam to clay loam", temperature: "13-24°C", rainfall: "350-500mm", humidity: "55-65%" },
    description: "Onion is a critically important vegetable crop in India, essential for domestic consumption and a major export commodity. Price fluctuations make it a strategically sensitive crop.",
    image: "",
  },
  {
    name: "Groundnut",
    season: "Kharif",
    category: "Oilseed",
    duration: "90-120 days",
    regions: ["Gujarat", "Rajasthan", "Andhra Pradesh", "Tamil Nadu", "Karnataka"],
    conditions: { soil: "Sandy loam, well-drained", temperature: "25-30°C", rainfall: "500-700mm", humidity: "60-70%" },
    description: "Groundnut is India's most important oilseed and a rich source of protein and oil. Gujarat alone accounts for over 30% of India's groundnut production.",
    image: "",
  },
  {
    name: "Turmeric",
    season: "Kharif",
    category: "Cash Crop",
    duration: "240-270 days",
    regions: ["Andhra Pradesh", "Telangana", "Tamil Nadu", "Odisha", "Maharashtra"],
    conditions: { soil: "Loamy, well-drained", temperature: "20-30°C", rainfall: "1000-2000mm", humidity: "70-80%" },
    description: "India produces 80% of the world's turmeric. With growing global demand for its medicinal and culinary uses, turmeric farming is increasingly profitable.",
    image: "",
  },
  {
    name: "Potato",
    season: "Rabi",
    category: "Vegetable",
    duration: "70-90 days",
    regions: ["Uttar Pradesh", "West Bengal", "Bihar", "Gujarat", "Punjab"],
    conditions: { soil: "Loamy, sandy loam", temperature: "15-20°C", rainfall: "400-600mm", humidity: "60-70%" },
    description: "Potato is India's most important vegetable crop by volume. India is the world's second largest producer, with growing demand from the processed food industry.",
    image: "",
  },
  {
    name: "Lentil",
    season: "Rabi",
    category: "Pulse",
    duration: "100-120 days",
    regions: ["Madhya Pradesh", "Uttar Pradesh", "Bihar", "Rajasthan", "West Bengal"],
    conditions: { soil: "Sandy loam to loam", temperature: "15-25°C", rainfall: "200-400mm", humidity: "50-60%" },
    description: "Lentil (Masoor Dal) is a cool-season pulse crop rich in protein. It's drought-tolerant, improves soil fertility, and is a staple in Indian cuisine.",
    image: "",
  },
  {
    name: "Sunflower",
    season: "Rabi",
    category: "Oilseed",
    duration: "90-100 days",
    regions: ["Karnataka", "Andhra Pradesh", "Maharashtra", "Bihar", "Odisha"],
    conditions: { soil: "Well-drained loamy", temperature: "20-25°C", rainfall: "400-600mm", humidity: "55-65%" },
    description: "Sunflower is a high-value oilseed crop with superior oil quality. It adapts well to varied climates and is one of the fastest growing oilseed crops in India.",
    image: "",
  },
  {
    name: "Bitter Gourd",
    season: "All Season",
    category: "Vegetable",
    duration: "55-70 days",
    regions: ["Uttar Pradesh", "Bihar", "West Bengal", "Odisha", "Kerala"],
    conditions: { soil: "Sandy loam, rich organic matter", temperature: "24-35°C", rainfall: "400-700mm", humidity: "65-75%" },
    description: "Bitter gourd is a fast-growing, high-value vegetable with significant medicinal properties. It can be grown year-round and yields strong returns in local markets.",
    image: "",
  },
  {
    name: "Garlic",
    season: "Rabi",
    category: "Vegetable",
    duration: "120-160 days",
    regions: ["Madhya Pradesh", "Gujarat", "Rajasthan", "Uttar Pradesh", "Maharashtra"],
    conditions: { soil: "Sandy loam to clay loam", temperature: "12-20°C", rainfall: "300-500mm", humidity: "50-60%" },
    description: "Garlic is a high-value spice crop with increasing export potential. India is the world's second largest producer, with Madhya Pradesh as the leading state.",
    image: "",
  },
  {
    name: "Pigeon Pea",
    season: "Kharif",
    category: "Pulse",
    duration: "150-200 days",
    regions: ["Maharashtra", "Karnataka", "Madhya Pradesh", "Andhra Pradesh", "Uttar Pradesh"],
    conditions: { soil: "Sandy loam to clay loam", temperature: "25-35°C", rainfall: "600-1000mm", humidity: "55-70%" },
    description: "Pigeon Pea (Tur/Arhar Dal) is India's second most important pulse crop. It's drought-tolerant, fixes nitrogen, and is intercropped widely with cotton and sorghum.",
    image: "",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing crops
    await Crop.deleteMany({});
    console.log("🗑️  Cleared existing crops");

    // Insert all crops
    const inserted = await Crop.insertMany(crops);
    console.log(`🌱 Seeded ${inserted.length} crops successfully`);

    // Print summary
    const bySeason = crops.reduce((acc, c) => {
      acc[c.season] = (acc[c.season] || 0) + 1;
      return acc;
    }, {});
    console.log("\n📊 Summary by season:");
    Object.entries(bySeason).forEach(([s, n]) => console.log(`   ${s}: ${n} crops`));

    const byCategory = crops.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    console.log("\n📊 Summary by category:");
    Object.entries(byCategory).forEach(([c, n]) => console.log(`   ${c}: ${n} crops`));

    console.log("\n✅ Seeding complete! Run your server and visit /api/crops to verify.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();
