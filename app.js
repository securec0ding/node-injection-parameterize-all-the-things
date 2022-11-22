const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const morganBody = require('morgan-body')
const sqlite3 = require('sqlite3')

const app = express()

const db = new sqlite3.Database(':memory:')
createTable()

app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('combined'))
morganBody(app, {noColors: true, prettify: false, maxBodyLength: 8000})

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Employees',
    employees: [],
  })
})

app.post('/', (req, res) => {
  searchEmployees(req.body.search).then((data) => {
    res.render('index', {
      title: 'Employees',
      employees: data,
    })
  }).catch(e => {
    res.render('index', {
      title: 'Employees',
      employees: [],
    })
  })
})

app.listen(process.env.VIRTUAL_PORT, () => console.log('Server running...'))

function searchEmployees(term) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM employees WHERE name LIKE '%"+term+"%'", (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function createTable() {
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS employees")
    db.run("CREATE TABLE employees (name TEXT, email TEXT, phone TEXT, dob TEXT, salary NUMERIC)")
    var inserts = db.prepare("INSERT INTO employees VALUES (?, ?, ?, ?, ?)")
    var employees = [
      {
        'name': 'Alice',
        'email': 'alice@bigco.rp',
        'phone': '202-555-5555',
        'dob': '04-01-1956',
        'salary': '75000.00',
      },
      {
        'name': 'Bob',
        'email': 'bob@bigco.rp',
        'phone': '323-867-5309',
        'dob': '12-31-1984',
        'salary': '40000.00',
      }
    ]
    employees.forEach((emp) => {
      inserts.run(emp.name, emp.email, emp.phone, emp.dob, emp.salary)
    })
    inserts.finalize()
  })
}