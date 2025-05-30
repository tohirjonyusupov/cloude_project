  const API_URL = 'http://13.53.206.222'; // IP manzilni moslang

  async function loadTasks() {
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      if (res.status !== 200) {
        throw new Error('Serverdan ma\'lumot olishda xatolik');
      }
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
      await axios.post(`${API_URL}/tasks`, { text });
      // Yangi vazifa qo'shilgandan so'ng, input maydonini tozalash va vazifalarni qayta yuklash
      alert("Vazifa qo'shildi");
      input.value = '';
      loadTasks();
    } catch (error) {
      console.error('Xatolik:', error);
      alert("Vazifani qo'shishda xatolik yuz berdi");
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      loadTasks();
    } catch (error) {
      console.error('Xatolik:', error);
      alert("Vazifani o‘chirishda xatolik yuz berdi");
    }
  }

  // Boshlanishida yuklash
  loadTasks();
