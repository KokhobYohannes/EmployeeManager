
USE employee_db;

INSERT INTO department (department)
VALUES 
('Marketing'),
('Business Development'),
('Accounting'),
('IT');

INSERT INTO role (title, salary, department_id)
VALUES
('Salesperson', 60000, 3),
('Accountant', 120000, 2),
('Engineer', 100000, 1),
('Manager', 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('First', 'Employee',1, 3),
('Second', 'Employee',2, 3),
('Third', 'Employee',4, 3),
('Fourth', 'Employee',2, 3),
('Five', 'Employee',3, 3),