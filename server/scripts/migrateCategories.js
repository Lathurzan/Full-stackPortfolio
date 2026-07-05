// One-off migration: convert `category` string field to an array of strings when necessary.
// Usage: node scripts/migrateCategories.js

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../dist/models/Project').default || require('../src/models/Project');

const MONGO = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

async function run() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Find documents where `category` exists and is a string (not an array)
  const docs = await Project.find({ category: { $type: 'string' } }).lean();
  console.log(`Found ${docs.length} projects with string category`);

  for (const doc of docs) {
    const cat = doc.category;
    if (!cat) continue;
    let arr = [];
    if (Array.isArray(cat)) arr = cat;
    else if (typeof cat === 'string') arr = cat.split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length === 0) continue;
    await Project.updateOne({ _id: doc._id }, { $set: { category: arr } });
    console.log(`Updated ${doc._id} ->`, arr);
  }

  console.log('Migration complete');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
