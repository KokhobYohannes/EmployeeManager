DROP DATABASE IF EXISTS employee_db;
CREATE database employee_db;

USE employee_db;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  department VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(20) NULL,
  salary DECIMAL(7, 2) NULL,
  department_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(20) NULL,
  last_name VARCHAR(20) NULL,
  role_id INT default 1,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES role(id)
);

SELECT * FROM department;
select * from role;
SELECT * FROM employee;