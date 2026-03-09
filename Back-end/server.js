const express = require("express")
const cors = require("cors")
const app = express()

app.use(express.json())
app.use(cors())

const connectDB = require("./config/db.js")
connectDB()

const authRouter = require("./routes/auth.js")
app.use(authRouter)

const PORT = 5000
app.listen(PORT,()=>{
    console.log(`server run on ${PORT} port`);
})