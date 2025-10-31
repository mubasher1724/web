const express = require('express');
const cors = require('cors');
const app = express();

// middleware
app.use(cors());
app.use(express.json()); // read JSON bodies

// in-memory data (resets on restart)
let notes = [{ id: 1, text: "First note" }];

app.get('/', (req, res) => {
  res.send('API is running ✅');
});

app.get('/notes', (req, res) => {
  res.json(notes);
});

app.post('/notes', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  const note = { id: Date.now(), text };
  notes.push(note);
  res.status(201).json(note);
});

app.listen(3000, () => console.log('http://localhost:3000'));
