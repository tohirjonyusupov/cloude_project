const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const app = express();
const PORT = 3000;
const DB_FILE = __dirname + '/db.json';

app.use(cors());
app.use(express.json());

// Ma'lumotlarni o'qish
function readTasks() {
  return fs.readJson(DB_FILE).catch(() => []);
}

// Ma'lumotlarni saqlash
function writeTasks(tasks) {
  return fs.writeJson(DB_FILE, tasks);
}

// Barcha vazifalarni olish
app.get('/tasks', async (req, res) => {
  const tasks = await readTasks();
  res.json(tasks);
});

// Yangi vazifa qo'shish
app.post('/tasks', async (req, res) => {
  const tasks = await readTasks();
  const newTask = { id: Date.now(), text: req.body.text };
  tasks.push(newTask);
  await writeTasks(tasks);
  res.json(newTask);
});

// Vazifani o‘chirish
app.delete('/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  let tasks = await readTasks();
  tasks = tasks.filter(t => t.id !== id);
  await writeTasks(tasks);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
