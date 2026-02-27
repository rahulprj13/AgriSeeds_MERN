const express = require("express")
const app = express()

// const user = {
//     name:"rahul",
//     age:23,
//     city:"patan",
// };

// app.get("/user", (req,res) =>{
//     // res.send("this is our first")  

//     res.json({
//         message:"user fetched successfullyl..",
//         data:user,

//     });
// });

// app.get("/user/:id", (req,res) =>{
//     console.log(req.params);
//     console.log(req.params.id);
//     res.json({
//         message:"data fetched"
//     })
// })



// const users = [
//     {id:1, name:"rahul",age:23},
//     {id:2, name:"piyush",age:23},
//     {id:3, name:"rajat",age:23},
//     {id:4, name:"raj",age:23},
// ]

// app.get("/users/:id", (req, res)=>{
//     console.log(req.params);
    
//     // res.json({
//     //     message:"fetched successfully",
//     //     data:users
//     // });

//     const user = users.find(u => u.id === parseInt(req.params.id));
//     if(!user){
//         return res.status(404).json({
//             message:"user not found"
//         });
//     }
//         res.json({
//             message:"user fetched successfully",
//             data:user
//         });

// });

const employee = require("./routes/EmployeeRoute.js")
app.use(employee)

const PORT = 3000
app.listen(PORT,()=>{
    console.log(`server run on ${PORT} port`);
})