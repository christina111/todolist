const todoApp = () => ({
  todos: [
    {
      id: 22,
      item: 'To pet Shaggy',
      completed: false,
      editing: false,
    },
    {
      id: 23,
      item: 'To finish the technical assignment',
      completed: true,
      editing: false,
    },
  ],
  filteredTodos: function () {
    return [...this.todos];
  },
  filterTasks: '',
  filterTodos() {
    if (this.todos?.length) {
      if (this.filterTasks === '') this.filteredTodos = this.todos;
      else if (Number(this.filterTasks))
        this.filteredTodos = this.todos.filter(todo => todo.completed === true);
      else
        this.filteredTodos = this.todos.filter(
          todo => todo.completed === false
        );
    }
  },
  addTodo(event) {
    event.preventDefault();

    var item = this.$root.querySelector('.user_input_task').value;

    if (item) {
      const id = Math.round(Math.random() * 10000);
      this.todos = [
        {
          id,
          item: item,
          completed: false,
          editing: false,
        },
        ...this.todos,
      ];

      this.filterTodos();
      this.$root.querySelector('.user_input_task').value = '';
    }
  },
  remove(event, id) {
    event.preventDefault();

    this.todos = this.todos.filter(todo => todo.id !== id);
    this.filterTodos();
  },
  setEdit(task) {
    task.editing = true;

    this.$root.querySelector('#task_edit-' + task.id.toString()).focus();
    this.filterTodos();
  },
  completeTodo(task) {
    task.completed = !task.completed;
    this.filterTodos();
  },
});
