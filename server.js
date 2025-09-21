const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB = path.join(__dirname, 'db.json');
if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({reports:[]}, null, 2));

function readDB(){
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); }
  catch(e){ return {reports:[]}; }
}
function writeDB(data){
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

app.get('/api/reports', (req, res) => {
  const db = readDB();
  res.json(db.reports || []);
});

app.post('/api/reports', (req, res) => {
  const r = req.body;
  if(!r) return res.status(400).json({ error: 'empty' });
  const db = readDB();
  const existing = db.reports.find(x => (x.id && r.id && x.id===r.id) || (x.ts && r.ts && x.ts===r.ts));
  if(!existing) db.reports.push(r);
  writeDB(db);
  res.status(201).json(r);
});

app.delete('/api/reports', (req, res) => {
  writeDB({reports:[]});
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server listening on', PORT));
