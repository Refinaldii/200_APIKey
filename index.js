import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import mysql from 'mysql2/promise';

const app = express();
const port = 3000;

// ======== Konfigurasi __dirname di ES Module =========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======== Middleware =========
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======== Jalankan server dalam fungsi async agar bisa pakai await di luar =========
async function startServer() {
  try {
    // ======== Koneksi ke MySQL =========
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'REFINALDI9786', // sesuaikan dengan milikmu
      database: 'apikey_db',
      port: 3309
    });

    // Cek koneksi
    const [info] = await db.query('SELECT DATABASE() AS db, @@port AS port');
    console.log(`✅ Terkoneksi ke database: ${info[0].db} (port ${info[0].port})`);

    // ======== Endpoint Tes Koneksi =========
    app.get('/testdb', async (req, res) => {
      try {
        const [rows] = await db.query('SELECT NOW() AS waktu');
        res.json({ success: true, waktu: rows[0].waktu });
      } catch (error) {
        console.error('❌ Error tes DB:', error);
        res.status(500).json({ success: false, message: error.message });
      }
    });


    
 // ======== Endpoint Membuat API Key =========
app.post('/create', async (req, res) => {
  console.log('📩 Endpoint /create dipanggil');

  try {
    const apiKey = 'API-' + crypto.randomBytes(16).toString('hex').toUpperCase();
    console.log('🔑 API Key yang dibuat:', apiKey);

    const [result] = await db.execute('INSERT INTO api_keys (key_value) VALUES (?)', [apiKey]);
    console.log('🧾 Hasil eksekusi INSERT:', result);

    if (result.affectedRows > 0) {
      console.log('✅ Data tersimpan di database!');
    } else {
      console.log('⚠️ INSERT tidak menambah data apa pun!');
    }

    res.json({
      success: true,
      apiKey,
      message: '✅ API Key berhasil dibuat dan disimpan di database'
    });
  } catch (error) {
    console.error('❌ Error saat membuat API Key:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat API Key'
    });
  }
});


    // ======== Endpoint Mengecek API Key =========
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
        console.log(`🔍 Mengecek API Key: ${apiKey} | Ditemukan: ${rows.length > 0}`);

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
        console.error('❌ Error saat memeriksa API Key:', error);
        res.status(500).json({
          success: false,
          message: 'Terjadi kesalahan server'
        });
      }
    });

    app.get('/lihatdata', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM api_keys ORDER BY id DESC LIMIT 10');
  res.json(rows);
});


    // ======== Route utama =========
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // ======== Jalankan server =========
    app.listen(port, () => {
      console.log(`🚀 Server berjalan di http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
    process.exit(1); // hentikan server kalau DB gagal konek
  }
}

// Panggil fungsi utama
startServer();
