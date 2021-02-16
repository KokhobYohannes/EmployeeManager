// Variables
const mysql = require("mysql");
const inquirer = require("inquirer");
require('console.table');

const port = 3306;

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: 'root',

  // Your password
  password: 'password',
  database: 'employee_db',
});

connection.connect((err) => {
    if (err) throw err;
    console.log(`Application running on PORT: ${port}`);
    console.log(`
    ███████╗███╗░░░███╗██████╗░██╗░░░░░░█████╗░██╗░░░██╗███████╗███████╗
    ██╔════╝████╗░████║██╔══██╗██║░░░░░██╔══██╗╚██╗░██╔╝██╔════╝██╔════╝
    █████╗░░██╔████╔██║██████╔╝██║░░░░░██║░░██║░╚████╔╝░█████╗░░█████╗░░
    ██╔══╝░░██║╚██╔╝██║██╔═══╝░██║░░░░░██║░░██║░░╚██╔╝░░██╔══╝░░██╔══╝░░
    ███████╗██║░╚═╝░██║██║░░░░░███████╗╚█████╔╝░░░██║░░░███████╗███████╗
    ╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░░╚══════╝░╚════╝░░░░╚═╝░░░╚══════╝╚══════╝
    
    ███╗░░░███╗░█████╗░███╗░░██╗░█████╗░░██████╗░███████╗██████╗░
    ████╗░████║██╔══██╗████╗░██║██╔══██╗██╔════╝░██╔════╝██╔══██╗
    ██╔████╔██║███████║██╔██╗██║███████║██║░░██╗░█████╗░░██████╔╝
    ██║╚██╔╝██║██╔══██║██║╚████║██╔══██║██║░░╚██╗██╔══╝░░██╔══██╗
    ██║░╚═╝░██║██║░░██║██║░╚███║██║░░██║╚██████╔╝███████╗██║░░██║
    ╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝░╚═════╝░╚══════╝╚═╝░░╚═╝
    `);
    runSearch();
  });

function employeeSearch() {
    return new Promise((resolve) => {
        connection.query(`
            SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.department FROM employee
            INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department ON role.department_id = department.id
            ORDER BY employee.id;
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return;
            }
            console.table(result);
            resolve();
        });
    })
}

async function viewDept() {
    const departments = await getAllDepartments();

    if(!departments.length) {
        return;
    }
    data = await inquirer.prompt({
        name: 'choice',
        type: 'rawlist',
        message: 'Choose Department:',
        choices: departments
    });
    const department = data.choice;

    return new Promise((resolve) => {
        connection.query(`
            SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.department FROM employee
            INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department ON role.department_id = department.id
            WHERE department.department = '${department}'
            ORDER BY employee.id;
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve();
            }
            console.table(result);
            return resolve();
        });
    });
}

async function getEmployeeByRole(title) {
    return new Promise((resolve, reject) => {
        connection.query(`
                SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.department FROM employee
                INNER JOIN role ON role.id = employee.role_id
                INNER JOIN department ON role.department_id = department.id
                WHERE role.title = '${title}'
                ORDER BY employee.id;
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve([]);
            }
            return resolve(result);
        });
    });
}

async function viewRole() {

    const managers = await getEmployeeByRole('manager');
    const managerNames = managers.map((manager) => {
        return `${manager.first_name} ${manager.last_name}`;
    });
    const data = await inquirer.prompt({
        name: 'manager',
        type: 'rawlist',
        message: 'Choose Department:',
        choices: managerNames,
    });

    const managerFullName = data.manager.split(' ');
    const managerFirstName = managerFullName[0];
    const managerLastName = managerFullName[1];

    const manager = await getEmployee(managerFirstName, managerLastName);
    if(!manager) {
        console.log('No manager found with that name');
        return;
    }
    return new Promise((resolve, reject) => {
        connection.query(`
                SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.department FROM employee
                INNER JOIN role ON role.id = employee.role_id
                INNER JOIN department ON role.department_id = department.id
                WHERE employee.manager_id = ${manager.id}
                ORDER BY employee.id;
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return;
            }
            console.table(result);
            resolve();
        });
    });
}

function getAllDepartments(){
    return new Promise((resolve, reject) => {
        connection.query(`
        SELECT department FROM department;
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve([]);
            }
            const departments = result.map((rawEntry) => rawEntry.department);
            return resolve(departments);
        });
    });
}

function getAllRoles(){
    return new Promise((resolve, reject) => {
        connection.query(`
        SELECT title FROM role;
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve([]);
            }
            const roles = result.map((rawEntry) => rawEntry.title);
            return resolve(roles);
        });
    });
}

function getRole(title) {
    return new Promise((resolve, reject) => {
        connection.query(`
        SELECT * from role where title = '${title}'
        `, (error, result) => {
            if(error) {
                console.log('Could not read role from database');
                return resolve({});
            }
            if(result.length) {
                return resolve(result[0]);
            }
            return resolve({});
        });
    });
}

function getEmployee(firstName, lastName){
    return new Promise((resolve, reject) => {
        connection.query(`
        SELECT * from employee where first_name = '${firstName}' and last_name = '${lastName}'
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve({});
            }
            if(result.length) {
                return resolve(result[0]);
            }
            return resolve({});
        });
    });
}

function insertDepartment(department) {
    return new Promise((resolve, reject) => {
        connection.query(`
        INSERT INTO department (department)
        VALUES 
        ('${department}')
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve();
            }
            return resolve();
        });
    });
}

async function addDept() {
    const departments = await getAllDepartments();

    if(!departments.length) {
        return;
    }
    const data = await inquirer.prompt({
        name: 'department',
        message: 'Please provide department:',
    });
    const department = data.department;
    await insertDepartment(department);
}

function insertRole(role, salary, department) {
    return new Promise((resolve, reject) => {
        connection.query(`
        INSERT INTO role (title, salary, department_id)
        select '${role}', ${salary}, department.id from department
        where department.department = '${department}';
        `, (error, result) => {
            if(error) {
                console.log('Could not read from database');
                return resolve();
            }
            return resolve();
        });
    });
}

async function addRole() {
    // 1. get roles
    const roles = await getAllRoles();
    if(!roles.length) {
        return;
    }
    let  data = await inquirer.prompt({
        name: 'title',
        message: 'Please provide title:',
    });
    const title = data.title;

    // 2. get salary
    data = await inquirer.prompt({
        name: 'salary',
        message: 'Please provide salary:',
    });
    const salary = data.salary;

    const departments = await getAllDepartments();

    if(!departments.length) {
        return;
    }
    data = await inquirer.prompt({
        name: 'choice',
        type: 'rawlist',
        message: 'Choose Department:',
        choices: departments
    });
    const department = data.choice;

    await insertRole(title, salary, department);
}

async function updateEmployRole(firstName, lastName, title) {
    let role = await getRole(title);
    const roleId = role.id;

    return new Promise((resolve, reject) => {
        connection.query(`
        UPDATE employee
        SET role_id = ${roleId}
        WHERE first_name = '${firstName}' and last_name = '${lastName}'
        `, (error, result) => {
            if(error) {
                console.log('Could not update from database');
                return resolve()
            }
            return resolve();
        });
    });
}

async function updateRole() {
    // 1. Get first name
    let data = await inquirer.prompt({
        name: 'firstName',
        message: 'Please add first name:',
    });
    const firstName = data.firstName;

    // 2. Get last name
    data = await inquirer.prompt({
        name: 'lastName',
        message: 'Please add last name:',
    });
    const lastName = data.lastName;

    // 3. Get roles
    const roles = await getAllRoles();
    if(!roles.length) {
        return;
    }
    data = await inquirer.prompt({
        name: 'choice',
        type: 'rawlist',
        message: 'Choose Role:',
        choices: roles
    });
    const title = data.choice;

    await updateEmployRole(firstName, lastName, title);
}

async function insertEmployee(firstName, lastName, title, managerFirstName, managerLastName) {
    let manager = { id: 0 };
    if(managerFirstName && managerLastName) {
        manager = await getEmployee(managerFirstName, managerLastName)
    }
    const managerId = manager.id;

    let role = await getRole(title);
    const roleId = role.id;

    return new Promise((resolve, reject) => {
        connection.query(`
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUE ('${firstName}', '${lastName}', ${roleId}, ${managerId})
        `, (error) => {
            if(error) {
                console.log('Could not write from database');
                return resolve();
            }
            return resolve();
        });
    });
}

async function addEmployee() {
    // 1. Get first name
    let data = await inquirer.prompt({
        name: 'firstName',
        message: 'Please add first name:',
    });
    const firstName = data.firstName;

    // 2. Get last name
    data = await inquirer.prompt({
        name: 'lastName',
        message: 'Please add last name:',
    });
    const lastName = data.lastName;

    // 3. Get roles
    const roles = await getAllRoles();
    if(!roles.length) {
        return;
    }
    data = await inquirer.prompt({
        name: 'choice',
        type: 'rawlist',
        message: 'Choose Role:',
        choices: roles
    });
    const title = data.choice;

    // 4. Get manager data
    const managerFirstName = null;
    const managerLastName= null;
    // 5. Insert to database
    await insertEmployee(firstName, lastName, title, managerFirstName, managerLastName);
}


const runSearch = async () => {
    const data = await inquirer.prompt({
        name: 'action',
        type: 'rawlist',
        message: 'Employee tracker:',
        choices: [
            'View all employees',
            'View all employees by departments',
            'View all employees by manager',
            'Add department',
            'Add employee',
            'Add role',
            'Update employee role',
            'Exit',
        ]
    });
    switch(data.action) {
        case 'View all employees':
            await employeeSearch();
            break;
        case 'View all employees by departments':
            await viewDept();
            break;
        case 'View all employees by manager':
            await viewRole();
            break;
        case 'Add department':
            await addDept();
            break;
        case 'Add employee':
            await addEmployee();
            break;
        case 'Add role':
            await addRole();
            break;
        case 'Update employee role':
            await updateRole();
            break;
        case 'Exit':
            connection.end();
            process.exit(0);
    }
    await runSearch();
};
