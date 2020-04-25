const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employee_db",
});

// Initiate MySQL Connection.
connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

// Set up options
let options = {
  main: ["View", "Add", "Delete", "Update", "Exit"],
  view: ["All Employees", "All Employees By Role", "All Employees By Manager"],
  addDel: ["Employee", "Role", "Position"],
  update: ["Employee Position", "Employee Manager"],
  verbs: {
    do: "do",
    view: "view",
    add: "add",
    delete: "delete",
    update: "update",
  },
};
let choice;

// Initialize program
init(options.main, options.verbs.do);

// Main Functions
// Init function, ties getAction and actionSwitch together
async function init(option, verb) {
  try {
    let { action } = await getAction(option, verb);
    await actionSwitch(action);
  } catch (err) {
    console.log(err);
  }
}

// getAction serves as a universal prompt
function getAction(option, verb) {
  const action = inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to " + verb + "?",
    choices: option,
  });
  return action;
}

// actionSwitch evaluates prompts and calls the correct functions to manipulate data
async function actionSwitch(action) {
  try {
    switch (action) {
      case "View":
        choice = await getAction(options.view, options.verbs.view);
        switch (choice.action) {
          case "All Employees":
            allEmployees(true);
            break;
          case "All Employees By Role":
            getRoles(allEmployeesRoles);
            break;
          case "All Employees By Manager":
            getManagers(allEmployeesManager);
            break;
          default:
            console.log("Error: No option selected");
        }
        break;
      case "Add":
        choice = await getAction(options.addDel, options.verbs.add);
        switch (choice.action) {
          case "Employee":
            addEmployee();
            break;
          case "Role":
            addDepartment();
            break;
          case "Position":
            addPosition();
            break;
          default:
            console.log("Error: No option selected");
        }
        break;
      case "Delete":
        choice = await getAction(options.addDel, options.verbs.delete);
        switch (choice.action) {
          case "Employee":
            allEmployees(false, deleteEmployee);
            break;
          case "Role":
            getRoles(deleteDepartment);
            break;
          case "Position":
            getPositions(deletePosition);
            break;
          default:
            console.log("Error: No option selected");
        }
        break;
      case "Update":
        choice = await getAction(options.update, options.verbs.update);
        switch (choice.action) {
          case "Employee Position":
            getPositions(updateEmployeePosition);
            break;
          case "Employee Manager":
            console.log("Coming Soon!");
            break;
          default:
            console.log("Error: No option selected");
        }
        break;
      case "Exit":
        return connection.end();
      default:
        console.log("Error: No option selected");
    }
  } catch (err) {
    console.log(err);
  }
}

//View Functions
function allEmployees(runInit, cb) {
  connection.query(
    "SELECT e.id 'ID', e.first_name 'First Name', e.last_name 'Last name', department.role 'Department', positions.title 'Position', positions.salary 'Salary', CONCAT(f.first_name, ' ', f.last_name) AS 'Manager' FROM employee AS e left join employee AS f on e.manager_id = f.id INNER JOIN positions ON e.position_id = positions.id INNER JOIN department ON positions.department_id = department.id ORDER BY id;",
    function (err, result) {
      if (err) throw err;
      console.table(result);
      if (runInit === false) {
        console.log("\n");
        return cb();
      } else {
        init(options.main, options.verbs.do);
      }
    }
  );
}

async function allEmployeesRoles(array) {
  try {
    let { department } = await inquirer.prompt([
      {
        type: "list",
        name: "department",
        message: "View all employees in which department?",
        choices: array,
      },
    ]);
    connection.query(
      "SELECT e.id 'ID', e.first_name 'First Name', e.last_name 'Last name', department.role 'Department', positions.title 'Position', positions.salary 'Salary', CONCAT(f.first_name, ' ', f.last_name) AS 'Manager' FROM employee AS e left join employee AS f on e.manager_id = f.id INNER JOIN positions ON e.position_id = positions.id INNER JOIN department ON positions.department_id = department.id WHERE department.role = ? ORDER BY id;",
      [department],
      function (err, result) {
        if (err) throw err;
        console.table(result);
        init(options.main, options.verbs.do);
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function allEmployeesManager(array) {
  try {
    let { manager } = await inquirer.prompt([
      {
        type: "list",
        name: "manager",
        message: "View all employees by which manager?",
        choices: array,
      },
    ]);
    let index = array.indexOf(manager);
    switch (index) {
      case 0:
        connection.query(
          "SELECT e.id 'ID', e.first_name 'First Name', e.last_name 'Last name', department.role 'Department', positions.title 'Position', positions.salary 'Salary', CONCAT(f.first_name, ' ', f.last_name) AS 'Manager' FROM employee AS e left join employee AS f on e.manager_id = f.id INNER JOIN positions ON e.position_id = positions.id INNER JOIN department ON positions.department_id = department.id WHERE e.manager_id IS NULL ORDER BY id;",
          function (err, result) {
            if (err) throw err;
            console.table(result);
            init(options.main, options.verbs.do);
          }
        );
        break;
      default:
        connection.query(
          "SELECT e.id 'ID', e.first_name 'First Name', e.last_name 'Last name', department.role 'Department', positions.title 'Position', positions.salary 'Salary', CONCAT(f.first_name, ' ', f.last_name) AS 'Manager' FROM employee AS e left join employee AS f on e.manager_id = f.id INNER JOIN positions ON e.position_id = positions.id INNER JOIN department ON positions.department_id = department.id WHERE e.manager_id = ? ORDER BY id;",
          [index],
          function (err, result) {
            if (err) throw err;
            console.table(result);
            init(options.main, options.verbs.do);
          }
        );
    }
  } catch (err) {
    console.log(err);
  }
}

//Add Functions
async function addEmployee() {
  try {
    let  employee  = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "input",
        name: "position_id",
        message: "What is the employee's position ID?",
        choices: [1, 2, 3, 4],
      },
      {
        type: "input",
        name: "manager_id",
        message: "Who is the employee's manager?",
        choices: [1, 2],
      },
    ]);
    connection.query("INSERT INTO employee SET ?;", [employee], function (
      err,
      result
    ) {
      if (err) throw err;
      init(options.main, options.verbs.do);
    });
  } catch (err) {
    console.log(err);
  }
}

async function addDepartment() {
  try {
    let  role  = await inquirer.prompt([
      {
        type: "input",
        name: "role",
        message: "What is the department name?",
      },
    ]);
    connection.query("INSERT INTO department SET ?;", [role], function (
      err,
      result
    ) {
      if (err) throw err;
      init(options.main, options.verbs.do);
    });
  } catch (error) {
    console.log(error);
  }
}

async function addPosition() {
  try {
    let  position  = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "What is the position's name?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the position's salary?",
      },
      {
        type: "input",
        name: "department_id",
        message: "What is the position's department?",
      },
    ]);

    connection.query("INSERT INTO positions SET ?;", [position], function (
      err,
      result
    ) {
      if (err) throw err;
      init(options.main, options.verbs.do);
    });
  } catch (error) {
    console.log(error);
  }
}

//Delete Functions
async function deleteEmployee(array) {
  try {
    let  employee  = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
    ]);
    connection.query(
      "DELETE FROM employee WHERE first_name = ? and last_name = ?;",
      [employee.first_name, employee.last_name],
      function (err, result) {
        console.log(
          `${response.first_name} ${response.last_name} was deleted.`
        );
        if (err) throw err;
        init(options.main, options.verbs.do);
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function deleteDepartment(array) {
  try {
    let { role } = await inquirer.prompt([
      {
        type: "list",
        name: "role",
        message: "Which department would you like to delete?",
        choices: array,
      },
    ]);
    connection.query("DELETE FROM department WHERE ?;", [role], function (
      err,
      result
    ) {
      if (err) throw err;
      console.log(`${response.role} was deleted.`);
      init(options.main, options.verbs.do);
    });
  } catch (error) {
    console.log(error);
  }
}

async function deletePosition(array) {
  try {
    let { title } = await inquirer.prompt([
      {
        type: "list",
        name: "title",
        message: "What is the position you want to delete?",
        choices: array,
      },
    ]);
    connection.query("DELETE FROM positions WHERE ?;", [title], function (
      err,
      result
    ) {
      if (err) throw err;
      console.log(`${response.title} was deleted`);
      init(options.main, options.verbs.do);
    });
  } catch (error) {
    console.log(error);
  }
}

//Update Functions
async function updateEmployeePosition(array) {
  try {
    let position = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the first name of the employee you want to update?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the Last name of the employee you want to update?",
      },
      {
        type: "list",
        name: "position_id",
        message: "What is the employee's new position?",
        choices: array,
      },
    ]);
    connection.query("SELECT id, title From positions;", function (
      err,
      result
    ) {
      if (err) throw err;
      let choiceId;
      let choice = result.filter((word) => word.title === position.position_id);
      choiceId = choice[0].id;
      employeePositionCallback(
        choiceId,
        position.first_name,
        position.last_name
      );
    });
  } catch (error) {
    console.log(error);
  }
}

function employeePositionCallback(id, first_name, last_name) {
  connection.query(
    "UPDATE employee SET position_id = ? WHERE first_name = ? AND last_name = ?;",
    [id, first_name, last_name],
    function (err, result) {
      if (err) throw err;
      init(options.main, options.verbs.do);
    }
  );
}

//Utility Functions
function getRoles(cb) {
  let array = [];
  connection.query("SELECT DISTINCT role FROM department;", function (
    err,
    result
  ) {
    if (err) throw err;
    result.forEach((element) => array.push(element.role));
    cb(array);
  });
}
function getPositions(cb) {
  let array = [];
  connection.query("SELECT DISTINCT title FROM positions;", function (
    err,
    result
  ) {
    if (err) throw err;
    result.forEach((element) => array.push(element.title));
    cb(array);
  });
}

function getManagers(cb) {
  let array = ["No Manager"];
  connection.query(
    "SELECT distinct e.manager_id, CONCAT(f.first_name, ' ', f.last_name) AS 'Manager' FROM employee AS e left join employee AS f on e.manager_id = f.id;",
    function (err, result) {
      if (err) throw err;
      result.slice(1).forEach((element) => array.push(element.Manager));
      cb(array);
    }
  );
}
