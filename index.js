import express from 'express';
import mysql from 'mysql';
import path from 'path';
import dotenv from 'dotenv';

const app = express();
dotenv.config();
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get('/', (req, res) => {
  const filePath = path.resolve(path.resolve(), 'index.html');
  res.sendFile(filePath);
});

db.connect(function (err) {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }

  console.log('Connected as id ' + db.threadId);
});

app.get('/api/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: err });
    res.json(result);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, completed, due_date } = req.body;
  const sql = 'INSERT INTO tasks (Title, Completed, Due_date) VALUES (?, ?, ?)';
  const values = [title, completed, due_date];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding task:', err);
      return res.status(500).json({ error: 'Failed to add task' });
    }

    const insertedTaskId = result.insertId;
    const selectSql = 'SELECT * FROM tasks WHERE Id = ?';

    db.query(selectSql, [insertedTaskId], (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error fetching inserted task:', selectErr);
        return res.status(500).json({ error: 'Failed to fetch inserted task' });
      }
      const insertedTask = selectResult[0];
      res.status(201).json(insertedTask);
    });
  });
});

// app.put('/api/tasks/:taskId', (req, res) => {
//   const taskId = req.params.taskId;
//   const { title, completed } = req.body;

//   const sql = 'UPDATE tasks SET Title = ?, Completed = ? WHERE Id = ?';
//   const values = [title, completed, taskId];

//   db.query(sql, values, (err, result) => {
//     if (err) {
//       console.error('Error updating task:', err);
//       return res.status(500).json({ error: 'Failed to update task' });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Task not found' });
//     }
//     res.status(200).json({ message: 'Task updated successfully' });
//   });
// });

app.patch('/api/tasks/:taskId', (req, res) => {
  const taskId = req.params.taskId;
  const { title, completed } = req.body;

  const sql = 'UPDATE tasks SET Title = ?, Completed = ? WHERE ID = ?';
  const values = [title, completed, taskId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task updated successfully' });
  });
});

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const sql = 'DELETE FROM tasks WHERE Id = ?';
  db.query(sql, taskId, (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

app.listen(process.env.PORT, () => {
  console.log('Server is running');
});
