// API Configuration
const API_URL = 'http://13.53.206.222/api';

// Global variables
let tasks = [];
let isLoading = false;

// DOM elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const loading = document.getElementById('loading');
const addBtn = document.getElementById('addBtn');
const connectionStatus = document.getElementById('connectionStatus');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const remainingCount = document.getElementById('remainingCount');
const progressFill = document.getElementById('progressFill');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    
    // Add Enter key support
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isLoading) {
            addTask();
        }
    });
});

// Show/Hide loading state
function setLoading(loading) {
    isLoading = loading;
    const loadingEl = document.getElementById('loading');
    const addBtn = document.getElementById('addBtn');
    const taskInput = document.getElementById('taskInput');
    
    if (loading) {
        loadingEl.classList.add('show');
        addBtn.disabled = true;
        taskInput.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuklanmoqda...';
    } else {
        loadingEl.classList.remove('show');
        addBtn.disabled = false;
        taskInput.disabled = false;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Qo\'shish';
    }
}

// Update connection status
function updateConnectionStatus(connected) {
    const status = document.getElementById('connectionStatus');
    if (connected) {
        status.className = 'connection-status connected';
        status.innerHTML = '<i class="fas fa-circle"></i><span>Server bilan bog\'langan</span>';
    } else {
        status.className = 'connection-status disconnected';
        status.innerHTML = '<i class="fas fa-circle"></i><span>Server bilan bog\'lanmagan</span>';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Load tasks from API
async function loadTasks() {
    setLoading(true);
    hideAllStates();
    
    try {
        const response = await axios.get(`${API_URL}/tasks`);
        
        if (response.status !== 200) {
            throw new Error('Serverdan ma\'lumot olishda xatolik');
        }
        
        tasks = response.data || [];
        updateConnectionStatus(true);
        updateStats();
        updateDisplay();
        
    } catch (error) {
        console.error('Xatolik:', error);
        updateConnectionStatus(false);
        showErrorState();
        showToast('Ma\'lumotni yuklashda xatolik yuz berdi', 'error');
    } finally {
        setLoading(false);
    }
}

// Add new task
async function addTask() {
    const text = taskInput.value.trim();
    
    if (!text) {
        showToast('Maydon bo\'sh bo\'lishi mumkin emas', 'warning');
        taskInput.focus();
        return;
    }
    
    setLoading(true);
    
    try {
        const response = await axios.post(`${API_URL}/tasks`, { text });
        
        if (response.status === 200 || response.status === 201) {
            taskInput.value = '';
            showToast('Vazifa muvaffaqiyatli qo\'shildi');
            await loadTasks(); // Reload to get updated data
        } else {
            throw new Error('Vazifani qo\'shishda xatolik');
        }
        
    } catch (error) {
        console.error('Xatolik:', error);
        updateConnectionStatus(false);
        showToast('Vazifani qo\'shishda xatolik yuz berdi', 'error');
    } finally {
        setLoading(false);
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Bu vazifani o\'chirishni xohlaysizmi?')) {
        return;
    }
    
    // Optimistic update
    const taskElement = document.querySelector(`[data-task-id="${id}"]`);
    if (taskElement) {
        taskElement.style.animation = 'slideOut 0.3s ease';
        taskElement.style.transform = 'translateX(100%)';
        taskElement.style.opacity = '0';
    }
    
    try {
        const response = await axios.delete(`${API_URL}/tasks/${id}`);
        
        if (response.status === 200 || response.status === 204) {
            showToast('Vazifa o\'chirildi');
            await loadTasks(); // Reload to get updated data
        } else {
            throw new Error('Vazifani o\'chirishda xatolik');
        }
        
    } catch (error) {
        console.error('Xatolik:', error);
        updateConnectionStatus(false);
        showToast('Vazifani o\'chirishda xatolik yuz berdi', 'error');
        // Revert optimistic update
        if (taskElement) {
            taskElement.style.animation = '';
            taskElement.style.transform = '';
            taskElement.style.opacity = '';
        }
    }
}

// Toggle task completion (if API supports it)
async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    try {
        // Assuming API has PATCH endpoint for updating task status
        const response = await axios.patch(`${API_URL}/tasks/${id}`, {
            completed: !task.completed
        });
        
        if (response.status === 200) {
            showToast('Vazifa holati o\'zgartirildi');
            await loadTasks();
        } else {
            throw new Error('Vazifa holatini o\'zgartirishda xatolik');
        }
        
    } catch (error) {
        console.error('Xatolik:', error);
        // If API doesn't support completion, just show message
        showToast('Vazifa holati o\'zgartirish qo\'llab-quvvatlanmaydi', 'warning');
    }
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    totalCount.textContent = total;
    completedCount.textContent = completed;
    remainingCount.textContent = remaining;
    progressFill.style.width = percentage + '%';
}

// Update display
function updateDisplay() {
    hideAllStates();
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        emptyState.classList.add('show');
        return;
    }
    
    tasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-task-id', task.id);
    
    li.innerHTML = `
        <div class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</div>
        <div class="task-actions">
            ${task.completed !== undefined ? `
                <button class="task-complete" onclick="toggleTask(${task.id})" title="${task.completed ? 'Bajarilmagan deb belgilash' : 'Bajarilgan deb belgilash'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
            ` : ''}
            <button class="task-delete" onclick="deleteTask(${task.id})" title="O'chirish">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return li;
}

// Hide all states
function hideAllStates() {
    emptyState.classList.remove('show');
    errorState.classList.remove('show');
}

// Show error state
function showErrorState() {
    hideAllStates();
    errorState.classList.add('show');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Handle online/offline events
window.addEventListener('online', () => {
    updateConnectionStatus(true);
    loadTasks();
});

window.addEventListener('offline', () => {
    updateConnectionStatus(false);
});