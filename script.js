class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentFilter = "all";
    this.taskIdCounter = this.getLastTaskId() + 1;
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();
    this.updateStats();
  }

  bindEvents() {
    const taskInput = document.getElementById("taskInput");
    const addBtn = document.getElementById("addBtn");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const clearCompletedBtn = document.getElementById("clearCompleted");

    addBtn.addEventListener("click", () => this.addTask());
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    clearCompletedBtn.addEventListener("click", () => this.clearCompleted());
  }

  addTask() {
    const input = document.getElementById("taskInput");
    const text = input.value.trim();

    if (text === "") {
      this.showError("Please enter a task");
      return;
    }

    const task = {
      id: this.taskIdCounter++,
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    input.value = "";
    this.saveTasks();
    this.render();
    this.updateStats();

    // Add some visual feedback
    input.style.transform = "scale(1.02)";
    setTimeout(() => {
      input.style.transform = "scale(1)";
    }, 150);
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
      this.updateStats();
    }
  }

  editTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (task) {
      const newText = prompt("Edit task:", task.text);
      if (newText !== null && newText.trim() !== "") {
        task.text = newText.trim();
        this.saveTasks();
        this.render();
      }
    }
  }

  deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.saveTasks();
      this.render();
      this.updateStats();
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;

    // Update active filter button
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active");

    this.render();
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "active":
        return this.tasks.filter((task) => !task.completed);
      case "completed":
        return this.tasks.filter((task) => task.completed);
      default:
        return this.tasks;
    }
  }

  render() {
    const container = document.getElementById("tasksContainer");
    const emptyState = document.getElementById("emptyState");
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      container.innerHTML = "";
      container.appendChild(emptyState);
      return;
    }

    container.innerHTML = "";

    filteredTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      container.appendChild(taskElement);
    });
  }

  createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = `task-item ${task.completed ? "completed" : ""}`;

    taskDiv.innerHTML = `
                    <div class="task-checkbox ${
                      task.completed ? "checked" : ""
                    }" 
                         onclick="app.toggleTask(${task.id})"></div>
                    <div class="task-text ${
                      task.completed ? "completed" : ""
                    }">${this.escapeHtml(task.text)}</div>
                    <div class="task-actions">
                        <button class="task-btn edit-btn" onclick="app.editTask(${
                          task.id
                        })" 
                                title="Edit task">✏️</button>
                        <button class="task-btn delete-btn" onclick="app.deleteTask(${
                          task.id
                        })" 
                                title="Delete task">🗑️</button>
                    </div>
                `;

    return taskDiv;
  }

  updateStats() {
    const activeTasks = this.tasks.filter((task) => !task.completed).length;
    const completedTasks = this.tasks.filter((task) => task.completed).length;
    const statsElement = document.getElementById("taskStats");
    const clearBtn = document.getElementById("clearCompleted");

    statsElement.textContent = `${activeTasks} ${
      activeTasks === 1 ? "task" : "tasks"
    } remaining`;

    clearBtn.disabled = completedTasks === 0;
    if (completedTasks > 0) {
      clearBtn.textContent = `Clear ${completedTasks} Completed ${
        completedTasks === 1 ? "Task" : "Tasks"
      }`;
    } else {
      clearBtn.textContent = "Clear Completed Tasks";
    }
  }

  clearCompleted() {
    if (this.tasks.some((task) => task.completed)) {
      if (confirm("Are you sure you want to clear all completed tasks?")) {
        this.tasks = this.tasks.filter((task) => !task.completed);
        this.saveTasks();
        this.render();
        this.updateStats();
      }
    }
  }

  showError(message) {
    const input = document.getElementById("taskInput");
    const originalPlaceholder = input.placeholder;

    input.placeholder = message;
    input.style.borderColor = "#ff6b6b";

    setTimeout(() => {
      input.placeholder = originalPlaceholder;
      input.style.borderColor = "rgba(255, 255, 255, 0.2)";
    }, 2000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveTasks() {
    this.savedTasks = JSON.stringify(this.tasks);
  }

  loadTasks() {
    return [
      {
        id: 1,
        text: "Welcome to TaskFlow! Click the checkbox to complete this task.",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        text: "Try editing a task by clicking the pencil icon",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        text: "This is a completed task - you can filter to hide these",
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  getLastTaskId() {
    return this.tasks.length > 0 ? Math.max(...this.tasks.map((t) => t.id)) : 0;
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new TodoApp();
});
