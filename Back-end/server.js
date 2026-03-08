const express = require("express")
const app = express()

app.use(express.json())

const connectDB = require("./config/db.js")
connectDB()

// const employee = require("./routes/EmployeeRoute.js")
// app.use(employee)

// const userRoutes = require("./routes/UserRoutes.js")
// app.use(userRoutes)

const authRouter = require("./routes/auth.js")
app.use(authRouter)

const PORT = 5000
app.listen(PORT,()=>{
    console.log(`server run on ${PORT} port`);
})