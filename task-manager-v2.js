import readline from 'readline';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkIfTasksTableExists() {
  try {
    const [ results ] = await connection.query(
      `SHOW tables LIKE 'tasks'`
    );

    if (results.length === 0) {
      await createTasksTable();
    }
    await greetings();
  } catch (error) {
    console.log("An error occured ", error);
  }
}

async function createTasksTable() {
  try {
    await connection.query(
      `   CREATE TABLE tasks(
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          label VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          status VARCHAR(255) NOT NULL,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL
      )`
    );

    console.log("Table 'tasks' successfully created");
  } catch (error) {
    console.log("An error occured ", error);
  }
}

async function readTasks() {
  const [results] = await connection.query(`SELECT * FROM tasks`);

  if (results.length === 0) {
    console.log("No tasks yet, please create one.");
    returnToMainMenu();
  } else {
    const tasks = [];
    console.log("Here are your current tasks.");
    results.forEach(result => tasks.push({id: result.id, label: result.label, description: result.description, status: result.status}));
    tasks.forEach(task => console.log(`${task.id} -> Label: ${task.label} - Description:${task.description} - Status: ${task.status}`));
    return tasks;
  }
}

async function searchTaskByFilter() {
  rl.question('Which status would you find tasks by ? (Todo - Done - In progress)', async (status) => {
    console.log(`Here are your tasks with ${status} status: `);
    const [filteredTask] = await connection.query(`SELECT * FROM tasks WHERE status = ?`, [status]);
    console.log(filteredTask.forEach((task) => console.log(`Task number: ${task.id} - Label: ${task.label} - Description: ${task.description} - Status: ${task.status}`)));
    returnToMainMenu();
  });
}

async function addTask() {
  rl.question('What is your new task label ? \n ', (taskLabel) => {
    rl.question('Any description for it ? \n ', (taskDescription) => {
      rl.question('Alright, which status should have this task ? (Todo - In progress - Done)', (taskStatus) => {
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        try {
          connection.query(`INSERT INTO tasks (label, status, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`, [taskLabel, taskStatus, taskDescription, currentDate, currentDate]);

          console.log(`New task successfully added!\nName: ${taskLabel}\nDescription: ${taskDescription}\nStatus: ${taskStatus}!`);
          returnToMainMenu();
        } catch (error) {
          console.log("An error occured ", error);
        }
      })
    });
  });
}

async function deleteTask() {
  const tasks = await readTasks();

  rl.question('Which one would you delete? (Enter task number) \n', (taskId) => {
    const taskToDeleteId = parseInt(taskId);

    const taskToDelete = tasks.find(task => task.id === taskToDeleteId);

    if (!taskToDelete) {
      console.log("Invalid task ID. Please try again.");
      return returnToMainMenu();
    }

    try {
      connection.query(`DELETE FROM tasks WHERE id = ?`, [taskToDelete.id]);
      console.log(`Task "${taskToDelete.label}" successfully deleted.`);
    } catch (error) {
      console.log("Error deleting task:", error.message);
    }

    returnToMainMenu();
  });
}

async function updateTask() {
  const tasks = await readTasks();

  rl.question('Which one would you update status ? (Enter task number) \n ', (taskId) => {
    const taskToUpdateId = parseInt(taskId);
    const taskToUpdate = tasks.find(task => task.id === taskToUpdateId);
    rl.question('Great, which status would you apply to that task ? \n ', (newStatus) => {

      connection.query(`UPDATE tasks SET status = ? WHERE id = ?`, [newStatus, taskToUpdateId]);

      console.log(`Task ${taskToUpdate.label} status successfully updated to ${newStatus}.`);
      returnToMainMenu();
    })
  });
}

function returnToMainMenu() {
  rl.question('Press * to return to main menu \n ', (answer) => {
    taskChoices(answer);
  });
}

function quit() {
  console.log("See you later ! \n");
  rl.close();
}

async function taskManager(action) {
  switch (action) {
    case '1' :
      await readTasks();
      returnToMainMenu();
      break;
    case '2' :
      await searchTaskByFilter();
      break;
    case '3' :
      await addTask();
      break;
    case '4' :
      await deleteTask();
      break;
    case '5' :
      await updateTask();
      break;
    case '6' :
      quit();
      break;
      default:
        console.log("Please select a valid option");
        taskChoices();
  }
}

async function taskChoices() {
  rl.question('Press: \n' +
    '1. To see all your tasks \n'
    + '2. To search a task by status \n'
    + '3. To add a task \n'
    + '4. To delete a task \n'
    + '5. To mark a task as done \n'
    + '6. To Exit the task manager \n', (answer) => {
    taskManager(answer);
  });
}

async function greetings() {
  console.log("Hey and welcome to your perfect task manager ! \n");
  await taskChoices();
}

async function todoList() {
  await checkIfTasksTableExists();
}

await todoList();
