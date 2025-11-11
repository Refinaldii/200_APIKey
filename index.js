import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import mysql from 'mysql2/promise'; // pakai versi promise

const app = express();
const port = 3000;

// Dapatkan __dirname di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔗 Koneksi ke database
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',         // ganti sesuai user MySQL kamu
  password: '',         // ganti sesuai password MySQL kamu
  database: 'apikey_db' // database yang kita buat di atas
});

console.log('✅ Terhubung ke database MySQL');

// 🧩 Endpoint POST untuk membuat API key
app.post('/create', async (req, res) => {
  try {
    const apiKey = 'API-' + crypto.randomBytes(16).toString('hex').toUpperCase();

    // Simpan API key ke database
    await db.execute('INSERT INTO api_keys (key_value) VALUES (?)', [apiKey]);

    res.json({
      success: true,
      apiKey: apiKey,
      message: 'API Key berhasil dibuat dan disimpan di database'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat API Key'
    });
  }
});

// 🧩 Endpoint POST untuk memeriksa API key
app.post('/checkapi', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: 'API Key tidak boleh kosong!'
    });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM api_keys WHERE key_value = ?', [apiKey]);

    if (rows.length > 0) {
      res.json({
        success: true,
        message: '✅ API Key valid'
      });
    } else {
      res.status(401).json({
        success: false,
        message: '❌ API Key tidak ditemukan / tidak valid'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
});

// Route utama kirim index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
