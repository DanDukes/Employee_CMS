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

init();

//Main Functions
async function init() {
  try {
    let { action } = await getAction();
    await actionSwitch(action);
  } catch (err) {
    console.log(err);
  }
}

function getAction() {
  const action = inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: ["View", "Add", "Delete", "Update", "Exit"],
  });
  return action;
}

function actionSwitch(action) {
  switch (action) {
    case "View":
      return viewChoice();
    case "Add":
      return addChoice();
    case "Delete":
      return deleteChoice();
    case "Update":
      return updateChoice();
    case "Exit":
      return connection.end();
    default:
      console.log("Error: No option selected");
  }
}

//View Functions
async function viewChoice() {
  try {
    let { view } = await getView();
    viewSwitch(view);
  } catch (error) {}
}

function getView() {
  const view = inquirer.prompt([
    {
      type: "list",
      name: "view",
      message: "What would you like to view?",
      choices: [
        "All Employees",
        "All Employees By Department",
        "All Employees By Manager",
        "Exit",
      ],
    },
  ]);
  return view;
}

function viewSwitch(view) {
  switch (view) {
    case "All Employees":
      allEmployees(true);
      break;
    case "All Employees By Department":
      distinctDepartment(allEmployeesDepartment);
      break;
    case "All Employees By Manager":
      distinctManager(allEmployeesManager);
      console.log("All by Manager");
      break;
    case "Exit":
      connection.end();
      break;
    default:
      console.log("Error: No option selected");
  }
}

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
        init();
      }
    }
  );
}

async function allEmployeesDepartment(array) {
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
        init();
      }
    );
  } catch (error) {
    console.log(error);
  }
}

async function allEmployeesManager(array) {
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
          init();
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
          init();
        }
      );
  }
}

//Add Functions
async function addChoice() {
    try {
      let { addType } = await getAdd();
      addSwitch(addType);
    } catch (error) {}
  }

function getAdd(){
    inquirer.prompt([{
        type: 'list',
        name: 'addType',
        message: 'What would you like to add?',
        choices:
            [
                'Employee',
                'Department',
                'Position'
            ]
    }])
    return addType;
}

function addSwitch(){
    switch (addType) {
        case 'Employee':
            addEmployee();
            break;
        case 'Department':
            addDepartment()
            break;
        case 'Position':
            addPosition();
            break;
        default:
            console.log("Error: No option selected");
    }
}

//Delete Functions
 async function deleteChoice() {
  try {
    let { deleteType } = await getDelete();
    deleteSwitch(deleteType);
  } catch (error) {
      console.log(error)
  }
}

//Update Functions
function updateChoice() {
  console.log("Update");
  init();
}

//Dynamic Functions
function distinctDepartment(cb) {
  let deptArray = [];
  connection.query("SELECT DISTINCT role FROM department;", function (
    err,
    result
  ) {
    if (err) throw err;
    result.forEach((element) => deptArray.push(element.role));
    cb(deptArray);
  });
}

function distinctManager(cb) {
  let managerArray = ["No Manager"];
  connection.query(
    "SELECT distinct e.manager_id, CONCAT(f.first_name, ' ', f.last_name) AS 'Manager' FROM employee AS e left join employee AS f on e.manager_id = f.id;",
    function (err, result) {
      if (err) throw err;
      for (let i = 1; i < result.length; i++) {
        managerArray.push(result[i].Manager);
      }
      cb(managerArray);
    }
  );
}
