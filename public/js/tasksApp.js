const tasksApp = () => ({
  tasks: [],
  filteredTasks: [],
  filterValue: '',
  validationError: '',
  sortValue: 'date-added',
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
  addTask(event) {
    event.preventDefault();

    const title = this.$root.querySelector('.user-input-task').value;
    const due_date = this.$root.querySelector('#due-date').value.toString();

    if (!title) {
      this.validationError = 'Please fill out the task description!';
      return;
    }

    this.validationError = '';

    const newTask = {
      title,
      completed: false,
      editing: false,
      due_date,
    };

    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to add task');
        return response.json();
      })
      .then(data => {
        this.tasks.unshift(data);
        this.filteredTasks.unshift(data);

        if (this.sortValue) this.sortTasks();

        this.filterTasks();
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });

    this.$root.querySelector('.user-input-task').value = '';
    this.$root.querySelector('#due-date').value = '';
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
    task.newTitle = task.title;
    task.editing = true;
    setTimeout(() => {
      this.$root.querySelector(`#task-edit-${task.id.toString()}`).focus();
    });
  },
  updateTask(task) {
    const previousTitle = task.title;

    const data = {
      id: task.id,
      title: task.title,
      completed: task.completed,
    };

    fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => {
        task.editing = false;

        if (!response.ok) {
          throw new Error('Failed to update task');
          task.title = previousTitle;
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
