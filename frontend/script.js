const API_URL = 'http://localhost:3000/tasks';

async function loadTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  const list = document.getElementById('taskList');
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    const btn = document.createElement('button');
    btn.textContent = '✖';
    btn.onclick = () => deleteTask(task.id);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

async function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (!text) {
    alert("Maydon bo'sh bo'lishi mumkin emas")
    return
  };
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  input.value = '';
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadTasks();
}

// Boshlanishida yuklash
loadTasks();
