import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const app = express();
const port = 3000;

// Dapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json()); // untuk parsing body JSON
app.use(express.static(path.join(__dirname, 'public')));

// Simpan API Key contoh (sementara, tanpa database)
let myApiKey = null;

// Endpoint contoh
app.get('/test', (req, res) => {
  res.send('Hello World!');
});

// Endpoint POST untuk membuat API key
app.post('/create', (req, res) => {
  // Membuat API key acak dan aman secara kriptografis
  const apiKey = 'API-' + crypto.randomBytes(16).toString('hex').toUpperCase();

  // Simpan API key ke variabel global
  myApiKey = apiKey;

  res.json({
    success: true,
    apiKey: apiKey
  });
});

// ✅ Endpoint POST untuk memeriksa API key
app.post('/checkapi', (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: 'API Key tidak boleh kosong!'
    });
  }

  if (apiKey === myApiKey) {
    res.json({
      success: true,
      message: 'API Key valid ✅'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'API Key tidak valid ❌'
    });
  }
});

// Route utama kirim index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
