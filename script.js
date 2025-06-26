// script.js

function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getTimeStatus(dueDate) {
  const now = new Date();
  const timeDiff = dueDate - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (timeDiff < 0) return 'overdue';
  if (hoursDiff <= 24) return 'due-soon';
  return 'normal';
}

function createTaskElement(taskData) {
  const li = document.createElement('li');
  li.className = `task-item ${taskData.priority}-priority`;

  const timeStatus = getTimeStatus(taskData.dueDate);
  if (timeStatus !== 'normal') {
    li.classList.add(timeStatus);
  }

  const taskContent = document.createElement('div');
  taskContent.className = 'task-content';

  const taskTitle = document.createElement('div');
  taskTitle.className = 'task-title';
  taskTitle.textContent = taskData.text;

  const taskDetails = document.createElement('div');
  taskDetails.className = 'task-details';
  taskDetails.textContent = `Created: ${formatDateTime(taskData.created)} | Due: ${formatDateTime(taskData.dueDate)} | Priority: ${taskData.priority}`;

  taskContent.appendChild(taskTitle);
  taskContent.appendChild(taskDetails);

  const taskActions = document.createElement('div');
  taskActions.className = 'task-actions';

  const completeBtn = document.createElement('button');
  completeBtn.textContent = "✓";
  completeBtn.title = "Mark as complete";
  completeBtn.addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = "❌";
  deleteBtn.title = "Delete task";
  deleteBtn.addEventListener('click', () => li.remove());

  taskActions.appendChild(completeBtn);
  taskActions.appendChild(deleteBtn);

  li.appendChild(taskContent);
  li.appendChild(taskActions);

  return li;
}

function addTask() {
  const taskInput = document.getElementById('task-input');
  const dueDateInput = document.getElementById('due-date');
  const dueTimeInput = document.getElementById('due-time');
  const priorityInput = document.getElementById('priority');

  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const dueTime = dueTimeInput.value;

  if (taskText === "" || !dueDate || !dueTime) {
    alert("Please fill in all fields!");
    return;
  }

  const taskData = {
    text: taskText,
    created: new Date(),
    dueDate: new Date(`${dueDate}T${dueTime}`),
    priority: priorityInput.value
  };

  const taskList = document.getElementById('task-list');
  const taskElement = createTaskElement(taskData);
  taskList.appendChild(taskElement);

  // Clear inputs
  taskInput.value = "";
  dueDateInput.value = "";
  dueTimeInput.value = "";
  priorityInput.value = "low";

  sortTasks();
}

function sortTasks() {
  const sortBy = document.getElementById('sort-by').value;
  const taskList = document.getElementById('task-list');
  const tasks = Array.from(taskList.children);

  tasks.sort((a, b) => {
    const aData = getTaskData(a);
    const bData = getTaskData(b);

    switch (sortBy) {
      case 'deadline':
        return aData.dueDate - bData.dueDate;
      case 'priority': {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[aData.priority] - priorityOrder[bData.priority];
      }
      case 'created':
        return aData.created - bData.created;
      default:
        return 0;
    }
  });

  tasks.forEach(task => taskList.appendChild(task));
}

function getTaskData(taskElement) {
  const detailsText = taskElement.querySelector('.task-details').textContent;
  const priorityClass = Array.from(taskElement.classList).find(c => c.includes('priority'));

  return {
    text: taskElement.querySelector('.task-title').textContent,
    created: new Date(detailsText.match(/Created: (.*?) \|/)[1]),
    dueDate: new Date(detailsText.match(/Due: (.*?) \|/)[1]),
    priority: priorityClass.replace('-priority', '')
  };
}

// Add event listener for sort selection
document.getElementById('sort-by').addEventListener('change', sortTasks);
