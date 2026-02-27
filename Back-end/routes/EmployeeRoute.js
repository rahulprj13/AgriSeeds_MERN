const router = require("express").Router()

const employees = require("../controller/Employees.js")
router.get("/employees",employees.empData)
router.get("/employee/:id",employees.empdataid)
router.get("/emp/:salary", employees.empsalary)

module.exports = router