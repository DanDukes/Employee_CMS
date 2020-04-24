DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  role VARCHAR(30) NULL,
  PRIMARY KEY (id)
);
CREATE TABLE positions (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NULL,
  salary DECIMAL(10,2) NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES department(id),
  PRIMARY KEY (id)
);
CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  position_id INT,
  manager_id INT DEFAULT NULL,
  FOREIGN KEY (position_id) REFERENCES positions(id),
  FOREIGN KEY (manager_id) REFERENCES employee(id),
  PRIMARY KEY (id)
);

INSERT INTO department (role)
VALUES ('Lead'), ('Employee');

INSERT INTO positions (title, salary, department_id)
VALUES ('Chief Medical Examiner', 277000, 1), ('Deputy Chief', 262000, 1), ('Assistant Medical Examiner', 215000, 2), ('Intern', 25000, 2);

INSERT INTO employee (first_name, last_name, position_id, manager_id)
VALUES 
    ('Erik', "Christensen", 1, null),
    ('Edward', 'Leis', 2, 1), 
    ('Michael', 'Belenky', 3, 1), 
    ('Pamela', 'Ulmer', 3, 1), 
    ('Kacy', 'Krehbiel', 3, 1), 
    ('Zach', 'Michalicek', 3, 1), 
    ('Jason', 'Lorenzo', 3, 1),
    ('Rebekah', 'Ess', 4, 2),
    ('Aaron', 'Nilsen', 4, 2),
    ('Heidi', 'Searle', 4, 2);
