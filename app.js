var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");

var connection = mysql.createConnection({
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

async function init() {
  try {
    let { action } = await getAction();
    actionSwitch(action);
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

function viewChoice() {
  console.log("View");
  init();
}

function addChoice() {
  console.log("Add");
  init();
}

function deleteChoice() {
  console.log("Delete");
  init();
}

function updateChoice() {
  console.log("Update");
  init();
}
