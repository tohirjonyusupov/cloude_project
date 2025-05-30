  const API_URL = 'http://13.53.206.222/tasks'; // IP manzilni moslang

  async function loadTasks() {
    try {
      const res = await axios.get(API_URL);
      const tasks = res.data;
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
    } catch (error) {
      console.error('Xatolik:', error);
      alert("Ma'lumotni yuklashda xatolik yuz berdi");
    }
  }

  async function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) {
      alert("Maydon bo'sh bo'lishi mumkin emas");
      return;
    }
    try {
      await axios.post(API_URL, { text });
      input.value = '';
      loadTasks();
    } catch (error) {
      console.error('Xatolik:', error);
      alert("Vazifani qo'shishda xatolik yuz berdi");
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
      loadTasks();
    } catch (error) {
      console.error('Xatolik:', error);
      alert("Vazifani o‘chirishda xatolik yuz berdi");
    }
  }

  // Boshlanishida yuklash
  loadTasks();
