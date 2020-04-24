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
    view: [
      "All Employees",
      "All Employees By Role",
      "All Employees By Manager",
      "Exit",
    ],
    addDel: ["Employee", "Role", "Position"],
    update: ["Employee Position", "Employee Manager"],
    verb: {do:"do", view:"view", add:"add", delete:"delete", update:"update"}
};
let choice;