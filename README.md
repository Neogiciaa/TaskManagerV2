### **My Pro Task Manager**

## Installation

You will need to create a MariaDB or Mysql database in local(you can use Docker to externalize it if wanted) first.

```bash
CREATE database task_manager;
GRANT ALL PRIVILEGES ON task_manager* TO "your_user"@localhost:3306;
Connect task_manager;
```

I recommend you to use a database manager like Datagrip from Jetbrain's suit for an easier configuration !
Once your database and user ready to use, clone this project and go ahead in .env.example file.
Rename this file to .env and put your credentials in it to be able to use My Pro Task Manager.

## Start project

To start the project, run:

```bash
yarn start
```

## Features

# Available
In My Pro Task Manager, you will be able to:
- Create tasks
- Read tasks
- Update tasks
- Delete tasks
- Search tasks by status
- Search tasks by keyword included in description
- Filter tasks by priority

# Coming soon
- Order tasks by creation/update date

## Author
Stéphen Chevalier - Passionated Web developer that code with ♥ 
