const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'plants.json');
const SEED_FILE = path.join(__dirname, 'data', 'seed.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Make sure a live data file exists; create it from the seed on first run.
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
  }
}

function readPlants() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writePlants(plants) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(plants, null, 2));
}

function nextId(plants) {
  const nums = plants.map(p => parseInt(p.id, 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(4, '0');
}

// GET all plants
app.get('/api/plants', (req, res) => {
  res.json(readPlants());
});

// POST a new plant
app.post('/api/plants', (req, res) => {
  const plants = readPlants();
  const body = req.body || {};
  if (!body.localName || !body.localName.trim()) {
    return res.status(400).json({ error: 'localName is required' });
  }
  const entry = {
    id: nextId(plants),
    localName: body.localName.trim(),
    commonName: (body.commonName || '').trim(),
    sciName: (body.sciName || '').trim(),
    category: (body.category || 'Uncategorized').trim(),
    region: (body.region || '').trim(),
    uses: (body.uses || '').trim(),
    prep: (body.prep || '').trim(),
    notes: (body.notes || '').trim()
  };
  plants.push(entry);
  writePlants(plants);
  res.status(201).json(entry);
});

// PUT (update) an existing plant
app.put('/api/plants/:id', (req, res) => {
  const plants = readPlants();
  const idx = plants.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const body = req.body || {};
  if (!body.localName || !body.localName.trim()) {
    return res.status(400).json({ error: 'localName is required' });
  }
  plants[idx] = {
    id: req.params.id,
    localName: body.localName.trim(),
    commonName: (body.commonName || '').trim(),
    sciName: (body.sciName || '').trim(),
    category: (body.category || 'Uncategorized').trim(),
    region: (body.region || '').trim(),
    uses: (body.uses || '').trim(),
    prep: (body.prep || '').trim(),
    notes: (body.notes || '').trim()
  };
  writePlants(plants);
  res.json(plants[idx]);
});

// DELETE a plant
app.delete('/api/plants/:id', (req, res) => {
  let plants = readPlants();
  const before = plants.length;
  plants = plants.filter(p => p.id !== req.params.id);
  if (plants.length === before) return res.status(404).json({ error: 'Not found' });
  writePlants(plants);
  res.status(204).end();
});

// Reset to the default seed catalog
app.post('/api/plants/reset', (req, res) => {
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  writePlants(seed);
  res.json(seed);
});

app.listen(PORT, () => {
  console.log(`Tree guide dashboard running at http://localhost:${PORT}`);
});
