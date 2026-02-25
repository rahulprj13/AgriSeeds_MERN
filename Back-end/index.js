// const express = require("express")
// const app = express()

// app.get("/", (req, res) =>{
//     res.send("hello montu...")

// })

// app.get("/getdata", (req, res) =>{
//     console.log(req)
//     res.send([
//         {
//         name:"rahul",
//         age:"20"
//         },{
//         name:"montu",
//         age:"20"
//         },{
//         name:"rahul",
//         age:"20"
//         },{
//         name:"rahul",
//         age:"20"
//         },{
//         name:"rahul",
//         age:"20"
//         },
// ])

// })

// app.get("/", (req, res) =>{
//     res.send("hello montu...")

// })

// app.listen(5000,()=>{
//     console.log("server is running on port 5000...");
    
// })


console.log("index js file");

// user file
const user= require("./user")
console.log("name is ",user.name);
console.log(user.data(189));

//employee file
const emp = require("./employee")
console.log(emp);

const userdata = emp
console.log("age is",userdata.emp.age);




