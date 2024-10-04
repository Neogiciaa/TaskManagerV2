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
      console.log('TABLE EXIST PAS -> CREATE !');
      await createTasksTable();
    }
    console.log('TABLE EXISTS -> Greeting !');
    await greetings();
  } catch (error) {
    console.log("An error occured ", error);
  }
}

async function createTasksTable() {
  try {
    const [ results ] = await connection.query(
      `   CREATE TABLE tasks(
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          label VARCHAR(255) NOT NULL,
          status BOOLEAN
      )`
    );

    console.log("Table 'tasks' successfully created");
  } catch (error) {
    console.log("An error occured ", error);
  }
}

async function readTasks() {
  const response = await fetch(url);
  const tasks = await response.json();

  if (tasks.length === 0) {
    console.log("No tasks yet, please create one.");
    returnToMainMenu();
  } else {
    console.log(tasks);
    returnToMainMenu();
  }
}

function addTask() {
  rl.question('What do you plan to do ? \n ', (taskName) => {
    rl.question('Which status is that task ? \n ', (taskStatus) => {
      let newTask = {label: `${taskName}`, status: `${taskStatus}`};
      fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newTask),
      })
        .then(response => response.json())
        .then(() => {
          console.log(`New task successfully added: ${taskName}, ${taskStatus}! \n`);
          returnToMainMenu();
        })
    });
  });
}

function deleteTask() {
  fetch(url)
    .then(response => response.json())
    .then(tasks => {
      let tasksLength = tasks.length;
      console.log(`You have ${tasksLength} tasks at the moment :`);
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.label}`);
      });

      rl.question('Which one would you delete? (Enter task number) \n', (answer) => {
        let taskIndex = answer - 1;
        let taskToDelete = tasks[taskIndex];
        console.log(`Trying to delete task with ID: ${taskToDelete.id}`);

        fetch(`${url}/${taskToDelete.id}`, {
          method: 'DELETE'
        })
          .then(response => {
            if (!response.ok) {
              console.log("Response status:", response.status);
              throw new Error("Failed to delete the task.");
            }
            console.log(`Task "${taskToDelete.label}" successfully deleted.`);
            returnToMainMenu();
          })
          .catch(error => {
            console.log("Error deleting task:", error.message);
            returnToMainMenu();
          });
      });
    })
}

function updateTask() {
  let tasksLength = tasks.length;
  console.log(`You have ${tasksLength} tasks at the moment :`);
  console.log(tasks.map(task => task));

  rl.question('Which one would you update status ? \n ', (answer) => {
    let taskToUpdate = tasks[answer - 1];
    rl.question('Great, which status would you apply to that task ? \n ', (answer) => {
      taskToUpdate.status = answer;
      console.log(`Task ${taskToUpdate.label} status successfully updated.`);
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
      break;
    case '2' :
      await addTask();
      break;
    case '3' :
      await deleteTask();
      break;
    case '4' :
      await updateTask();
      break;
    case '5' :
      quit();
      break;
  }
}

async function taskChoices() {
  rl.question('Press: \n' +
    '1. To see all your tasks \n'
    + '2. To add a task \n'
    + '3. To delete a task \n'
    + '4. To mark a task as done \n'
    + '5. To Exit the task manager \n', (answer) => {
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
