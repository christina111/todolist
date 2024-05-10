const tasksApp = () => ({
  tasks: [],
  filteredTasks: [],
  filterValue: '',
  sortValue: 'date-added',
  previousTitle: '',
  newTask: {},
  fetchTasks() {
    fetch('/api/tasks')
      .then(response => response.json())
      .then(data => {
        if (data) {
          this.tasks = data;
          this.filteredTasks = [...this.tasks];
          this.sortTasks();
        }
      })
      .catch(error => console.error('Error fetching tasks:', error));
  },
  filterTasks() {
    if (this.filterValue === '') this.filteredTasks = [...this.tasks];
    else if (Number(this.filterValue))
      this.filteredTasks = this.tasks.filter(task => task.completed);
    else this.filteredTasks = this.tasks.filter(task => !task.completed);

    if (this.sortValue) this.sortTasks();
  },
  validateTaskTitle(task) {
    task.validationError = '';

    if (!task.title) {
      task.validationError = 'Please fill out the task description!';
      return false;
    }
    return true;
  },
  addTask(event) {
    event.preventDefault();

    const title = this.$root.querySelector('.user-input-task').value;
    const due_date = this.$root.querySelector('#due-date').value.toString();

    this.newTask = {
      title,
      completed: false,
      editing: false,
      due_date,
      validationError: '',
    };

    if (!this.validateTaskTitle(this.newTask)) return;

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.newTask),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to add task');
        return response.json();
      })
      .then(data => {
        this.tasks.unshift(data);
        this.filteredTasks.unshift(data);

        this.sortTasks();
        this.filterTasks();

        this.$root.querySelector('.user-input-task').value = '';
        this.$root.querySelector('#due-date').value = '';
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  },
  removeTask(taskId) {
    fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete task');
        this.fetchTasks();
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  },
  setEdit(task) {
    this.previousTitle = task.title;
    task.editing = true;
    setTimeout(() => {
      this.$root.querySelector(`#task-edit-${task.id}`).focus();
    });
  },
  updateTask(task) {
    const data = {
      id: task.id,
      title: task.title,
      completed: task.completed,
    };

    if (!this.validateTaskTitle(task)) {
      task.title = this.previousTitle;
      return;
    }

    fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => {
        task.editing = false;

        if (!response.ok) {
          throw new Error('Failed to update task');
          task.title = this.previousTitle;
        }
      })
      .catch(error => {
        console.error('Error updating task:', error);
      });
  },
  completeTask(task) {
    task.completed = !task.completed;
    this.updateTask(task);
    this.filterTasks();
  },
  noTasksText() {
    if (this.filterValue === '' || !this.tasks.length)
      return 'No tasks at the moment!';
    else if (Number(this.filterValue)) return 'There is no completed tasks!';
    else return 'All tasks are completed!';
  },
  sortTasks() {
    if (this.sortValue === 'due-date') {
      const tasksWithDueDate = this.filteredTasks.filter(task => task.due_date);
      const tasksWithoutDueDate = this.filteredTasks.filter(
        task => !task.due_date
      );

      tasksWithDueDate.sort((a, b) => {
        return new Date(a.due_date) - new Date(b.due_date);
      });

      this.filteredTasks = [...tasksWithDueDate, ...tasksWithoutDueDate];
    } else {
      this.filteredTasks.sort((a, b) => {
        return new Date(b.date_added) - new Date(a.date_added);
      });
    }
  },
});
