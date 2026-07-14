const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SEED_FILE = path.join(__dirname, 'data', 'seed.json');
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- MongoDB connection ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Schema ---
const plantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  localName: { type: String, required: true, trim: true },
  commonName: { type: String, default: '', trim: true },
  sciName: { type: String, default: '', trim: true },
  category: { type: String, default: 'Uncategorized', trim: true },
  region: { type: String, default: '', trim: true },
  uses: { type: String, default: '', trim: true },
  prep: { type: String, default: '', trim: true },
  notes: { type: String, default: '', trim: true }
}, { versionKey: false });

const Plant = mongoose.model('Plant', plantSchema);

// Make sure there's at least seed data on first run.
async function ensureSeeded() {
  const count = await Plant.countDocuments();
  if (count === 0 && fs.existsSync(SEED_FILE)) {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    if (seed.length) {
      await Plant.insertMany(seed);
      console.log(`Seeded database with ${seed.length} plants`);
    }
  }
}
mongoose.connection.once('open', ensureSeeded);

async function nextId() {
  const plants = await Plant.find({}, { id: 1, _id: 0 });
  const nums = plants.map(p => parseInt(p.id, 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(4, '0');
}

function toPlainPlant(doc) {
  const { _id, id, localName, commonName, sciName, category, region, uses, prep, notes } = doc.toObject ? doc.toObject() : doc;
  return { id, localName, commonName, sciName, category, region, uses, prep, notes };
}

// GET all plants
app.get('/api/plants', async (req, res) => {
  try {
    const plants = await Plant.find();
    res.json(plants.map(toPlainPlant));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// POST a new plant
app.post('/api/plants', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.localName || !body.localName.trim()) {
      return res.status(400).json({ error: 'localName is required' });
    }
    const id = await nextId();
    const entry = new Plant({
      id,
      localName: body.localName.trim(),
      commonName: (body.commonName || '').trim(),
      sciName: (body.sciName || '').trim(),
      category: (body.category || 'Uncategorized').trim(),
      region: (body.region || '').trim(),
      uses: (body.uses || '').trim(),
      prep: (body.prep || '').trim(),
      notes: (body.notes || '').trim()
    });
    await entry.save();
    res.status(201).json(toPlainPlant(entry));
  } catch (err) {
    res.status(500).json({ error: 'Failed to save plant' });
  }
});

// PUT (update) an existing plant
app.put('/api/plants/:id', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.localName || !body.localName.trim()) {
      return res.status(400).json({ error: 'localName is required' });
    }
    const updated = await Plant.findOneAndUpdate(
      { id: req.params.id },
      {
        localName: body.localName.trim(),
        commonName: (body.commonName || '').trim(),
        sciName: (body.sciName || '').trim(),
        category: (body.category || 'Uncategorized').trim(),
        region: (body.region || '').trim(),
        uses: (body.uses || '').trim(),
        prep: (body.prep || '').trim(),
        notes: (body.notes || '').trim()
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(toPlainPlant(updated));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// DELETE a plant
app.delete('/api/plants/:id', async (req, res) => {
  try {
    const deleted = await Plant.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// Reset to the default seed catalog
app.post('/api/plants/reset', async (req, res) => {
  try {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    await Plant.deleteMany({});
    await Plant.insertMany(seed);
    res.json(seed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset plants' });
  }
});

app.listen(PORT, () => {
  console.log(`Tree guide dashboard running at http://localhost:${PORT}`);
});
