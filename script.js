// script.js - Fixed version with better error handling

class TodoApp {
    constructor() {
        console.log('TodoApp initializing...');
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.taskIdCounter = this.getLastTaskId() + 1;
        this.init();
    }

    init() {
        console.log('TodoApp init started');
        this.bindEvents();
        this.render();
        this.updateStats();
        console.log('TodoApp init completed');
    }

    bindEvents() {
        console.log('Binding events...');
        
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clearCompleted');

        // Check if elements exist
        if (!taskInput) {
            console.error('taskInput element not found!');
            return;
        }
        if (!addBtn) {
            console.error('addBtn element not found!');
            return;
        }

        console.log('Elements found, adding event listeners...');

        // Add task events
        addBtn.addEventListener('click', (e) => {
            console.log('Add button clicked');
            e.preventDefault();
            this.addTask();
        });

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter key pressed');
                e.preventDefault();
                this.addTask();
            }
        });

        // Filter events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Filter button clicked:', e.target.dataset.filter);
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed events
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => {
                console.log('Clear completed clicked');
                this.clearCompleted();
            });
        }

        console.log('Event listeners added successfully');
    }

    addTask() {
        console.log('addTask called');
        
        const input = document.getElementById('taskInput');
        if (!input) {
            console.error('Input element not found in addTask');
            return;
        }

        const text = input.value.trim();
        console.log('Task text:', text);

        if (text === '') {
            console.log('Empty task, showing error');
            this.showError('Please enter a task');
            return;
        }

        const task = {
            id: this.taskIdCounter++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        console.log('Adding task:', task);

        this.tasks.unshift(task);
        input.value = '';
        this.saveTasks();
        this.render();
        this.updateStats();
        
        // Visual feedback
        input.style.transform = 'scale(1.02)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 150);

        console.log('Task added successfully');
    }

    toggleTask(id) {
        console.log('Toggling task:', id);
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    editTask(id) {
        console.log('Editing task:', id);
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                this.saveTasks();
                this.render();
            }
        }
    }

    deleteTask(id) {
        console.log('Deleting task:', id);
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    setFilter(filter) {
        console.log('Setting filter:', filter);
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        console.log('Rendering tasks...');
        
        const container = document.getElementById('tasksContainer');
        if (!container) {
            console.error('tasksContainer not found!');
            return;
        }

        const filteredTasks = this.getFilteredTasks();
        console.log('Filtered tasks:', filteredTasks.length);

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No tasks yet</h3>
                    <p>Add a task above to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="window.app.toggleTask(${task.id})"></div>
            <div class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="window.app.editTask(${task.id})" 
                        title="Edit task">✏️</button>
                <button class="task-btn delete-btn" onclick="window.app.deleteTask(${task.id})" 
                        title="Delete task">🗑️</button>
            </div>
        `;

        return taskDiv;
    }

    updateStats() {
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const statsElement = document.getElementById('taskStats');
        const clearBtn = document.getElementById('clearCompleted');

        if (statsElement) {
            statsElement.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
        }
        
        if (clearBtn) {
            clearBtn.disabled = completedTasks === 0;
            if (completedTasks > 0) {
                clearBtn.textContent = `Clear ${completedTasks} Completed ${completedTasks === 1 ? 'Task' : 'Tasks'}`;
            } else {
                clearBtn.textContent = 'Clear Completed Tasks';
            }
        }
    }

    clearCompleted() {
        if (this.tasks.some(task => task.completed)) {
            if (confirm('Are you sure you want to clear all completed tasks?')) {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.render();
                this.updateStats();
            }
        }
    }

    showError(message) {
        console.log('Showing error:', message);
        const input = document.getElementById('taskInput');
        if (input) {
            const originalPlaceholder = input.placeholder;
            
            input.placeholder = message;
            input.style.borderColor = '#ff6b6b';
            
            setTimeout(() => {
                input.placeholder = originalPlaceholder;
                input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }, 2000);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            console.log('Tasks saved to localStorage');
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('todoTasks');
            if (saved) {
                const tasks = JSON.parse(saved);
                console.log('Loaded tasks from localStorage:', tasks.length);
                return tasks;
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
        
        console.log('Using default tasks');
        return [
            {
                id: 1,
                text: "Welcome to TaskFlow! Click the checkbox to complete this task.",
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                text: "Try editing a task by clicking the pencil icon",
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    getLastTaskId() {
        return this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) : 0;
    }
}

// Initialize the app when DOM is ready
let app;

function initApp() {
    console.log('DOM loaded, initializing app...');
    try {
        window.app = new TodoApp();
        app = window.app; // For backward compatibility
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Multiple ways to ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Fallback initialization
window.addEventListener('load', () => {
    if (!window.app) {
        console.log('Fallback initialization...');
        initApp();
    }
});
