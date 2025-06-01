const express = require('express');
const cors = require('cors');
const pool = require('./db'); // PostgreSQL ulanishi

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // xavfsizlik uchun bu yerga frontend domenini yozish mumkin
  methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json());

// Asosiy route
app.get('/', (req, res) => {
  res.send('Task API ishlayapti!');
});

// Barcha vazifalarni olish
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    if (tasks.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vazifalar topilmadi' });
    }
    res.status(200).json(tasks.rows);
  } catch (err) {
    console.error('GET /tasks error:', err.message);
    res.status(500).json({ success: false, message: 'Vazifalarni olishda xatolik yuz berdi' });
  }
});

console.log("Deployed to AWS");


// Yangi vazifa qo'shish
app.post('/tasks', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Text bo‘sh bo‘lishi mumkin emas' });
    }

    await pool.query('INSERT INTO todos (text) VALUES ($1)', [text]);
    res.status(201).json({ success: true, message: 'Vazifa qo\'shildi' });
  } catch (err) {
    console.error('POST /tasks error:', err.message);
    res.status(500).json({ success: false, message: 'Vazifani qo‘shishda xatolik yuz berdi' });
  }
});

// Vazifani o‘chirish
app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID noto‘g‘ri' });
    }

    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Vazifa o‘chirildi' });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Vazifani o‘chirishda xatolik yuz berdi' });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
