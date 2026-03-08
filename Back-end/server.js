const express = require("express")
const app = express()

app.use(express.json())

const connectDB = require("./DB/db.js")
connectDB()

// const employee = require("./routes/EmployeeRoute.js")
// app.use(employee)

const userRoutes = require("./routes/UserRoutes.js")
app.use(userRoutes)

const PORT = 3000
app.listen(PORT,()=>{
    console.log(`server run on ${PORT} port`);
})