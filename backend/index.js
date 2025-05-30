const express = require('express');
const cors = require('cors');
const app = express();

const pool = require('./db'); // Postgres ulanishi

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Task API ishlayapti!');
});


// Barcha vazifalarni olish
app.get('/tasks', async (req, res) => {
  const tasks = await pool.query('SELECT * FROM todos ORDER BY id ASC'); // Postgresdan ma'lumot olish
  res.status(200).json(tasks.rows); // JSON formatida qaytarish
});

// Yangi vazifa qo'shish
app.post('/tasks', async (req, res) => {
  const text = req.body.text;
  await pool.query(`INSERT INTO todos (text) VALUES ($1)`, [text]); // Postgresga qo'shish
  res.status(201).json({ success: true, message: 'Vazifa qo\'shildi' });
});

// Vazifani o‘chirish
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await pool.query('DELETE FROM todos WHERE id = $1', [id]); // Postgresdan o'chirish
  res.status(200).json({ success: true, message: 'Vazifa o\'chirildi' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
