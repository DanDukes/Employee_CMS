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
let options = [
  ["View", "Add", "Delete", "Update", "Exit"],
  [
    "All Employees",
    "All Employees By Role",
    "All Employees By Manager",
    "Exit",
  ],
  ["Employee", "Role", "Position"],
  ["Employee Position", "Employee Manager"],
];
let verb = ["do", "view", "add", "delete", "update"];
let choice;

// Initialize program
init(options[0], verb[0]);

// Main Functions
// Init function, ties getAction and actionSwitch together
async function init(options, verb) {
  try {
    let { action } = await getAction(options, verb);
    await actionSwitch(action);
  } catch (err) {
    console.log(err);
  }
}

// getAction serves as a universal prompt
function getAction(options, verb) {
  const action = inquirer.prompt({
    type: "list",
    name: "action",
    message: "What would you like to " + verb + "?",
    choices: options,
  });
  return action;
}

// actionSwitch evaluates prompts and calls the correct functions to manipulate data
async function actionSwitch(action) {
  try {
    switch (action) {
      case "View":
        choice = await getAction(options[1], verb[1]);
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
        choice = await getAction(options[2], verb[2]);
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
        choice = await getAction(options[2], verb[3]);
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
        choice = await getAction(options[3], verb[4]);
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
        init(options[0], verb[0]);
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
        init(options[0], verb[0]);
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
          init(options[0], verb[0]);
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
          init(options[0], verb[0]);
        }
      );
  }
} catch (err){
    console.log(err);
}
}

//Add Functions
function addEmployee(array) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What is the employee's first name?",
        },
        {
            type: 'input',
            name: 'last_name',
            message: "What is the employee's last name?",
        },
        {
            type: 'input',
            name: 'position_id',
            message: "What is the employee's position ID?",
            // choices: array
            //this needs to be dynamic
            // [
            //     1,
            //     2,
            //     3,
            //     4
            // ]
        },
        {
            type: 'input',
            name: 'manager_id',
            message: "Who is the employee's manager?",
            //this needs to be dynamic and a list
        },
    ])
        .then(function (response) {
            connection.query(
                "INSERT INTO employee SET ?;",
                [response],
                function (err, result) {
                    if (err) throw err;
                    init();
                });
        }
        );
}

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "What is the department name?",
        }
    ])
        .then(function (response) {
            connection.query(
                "INSERT INTO department SET ?;",
                [response],
                function (err, result) {
                    if (err) throw err;
                    init();
                });
        }
        );
}

function addPosition() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: "What is the position's name?",
        },
        {
            type: 'input',
            name: 'salary',
            message: "What is the position's salary?",
        },
        {
            type: 'input',
            name: 'department_id',
            message: "What is the position's department?",
        }
    ])
        .then(function (response) {
            connection.query(
                "INSERT INTO positions SET ?;",
                [response],
                function (err, result) {
                    if (err) throw err;
                    init();
                });
        }
        );
}

//Delete Functions
function deleteEmployee(array) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What is the employee's first name?",
        },
        {
            type: 'input',
            name: 'last_name',
            message: "What is the employee's last name?",
        }
    ])
        .then(function (response) {
            // console.log(response);
            connection.query(
                "DELETE FROM employee WHERE first_name = ? and last_name = ?;",
                [response.first_name, response.last_name],
                function (err, result) {
                    console.log(`${response.first_name} ${response.last_name} was deleted.`)
                    if (err) throw err;
                    init();
                });
        }
        );
}

function deleteDepartment(array) {
    inquirer.prompt([
        {
            type: 'list',
            name: 'role',
            message: "Which department would you like to delete?",
            choices: array
        }
    ])
        .then(function (response) {
            connection.query(
                "DELETE FROM department WHERE ?;",
                [response],
                function (err, result) {
                    if (err) throw err;
                    console.log(`${response.role} was deleted.`)
                    init();
                });
        }
        );
}

function deletePosition(array) {
    inquirer.prompt([
        {
            type: 'list',
            name: 'title',
            message: "What is the position you want to delete?",
            choices: array
        }
    ])
        .then(function (response) {
            connection.query(
                "DELETE FROM positions WHERE ?;",
                [response],
                function (err, result) {
                    if (err) throw err;
                    console.log(`${response.title} was deleted`);
                    init();
                });
        }
        );
}

//Update Functions
function updateEmployeePosition(array) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "What is the first name of the employee you want to update?"
        },
        {
            type: 'input',
            name: 'last_name',
            message: "What is the first name of the employee you want to update?"
        },
        {
            type: 'list',
            name: 'position_id',
            message: "What is the employee's new position?",
            choices: array
        }
    ])
        .then(function (response) {
            connection.query(
                "SELECT id, title From positions;",
                function (err, result) {
                    if (err) throw err;
                    let choiceId;
                    let choice = result.filter(word => word.title === response.position_id);
                    choiceId = choice[0].id;
                    employeePositionCallback(choiceId, response.first_name, response.last_name);
                });
        }
        );
}

//Dynamic Functions
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
    connection.query(
        "SELECT DISTINCT title FROM positions;",
        function (err, result) {
            if (err) throw err;
            result.forEach(element => array.push(element.title));
            cb(array)
        }
    )
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

function employeePositionCallback(id, first_name, last_name) {
    connection.query(
        "UPDATE employee SET position_id = ? WHERE first_name = ? AND last_name = ?;",
        [id, first_name, last_name],
        function (err, result) {
            if (err) throw err;
            init();
        });
}
