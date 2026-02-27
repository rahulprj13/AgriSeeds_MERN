const employee = [
    {id:1, name:"rahul", age:23, salary:20000},
    {id:2, name:"raj", age:22,salary:25000},
    {id:3, name:"rohan", age:23,salary:30000},
    {id:4, name:"montu", age:33,salary:40000}
]

const empData = (req,res)=>{
    res.json({
        message:"user found",
        data : employee
    })
}

const empdataid = (req, res) =>{
    console.log(req.params.id);

    const found = employee.find((emp) => emp.id == req.params.id)
    if(found){
        res.json({
            message:"user found",
            data: found
        })
    }
    else{
        res.json({
            message:"user not found"
        })
    }
}

const empsalary = (req, res)=>{
    console.log(req.params.salary);
    
    const salary = employee.filter((sal) => sal.salary>25000)
    if(salary){
        res.json({
            message:"this is all user above 25000 salary",
            data:salary
        })
    }
}

module.exports={
    empData, empdataid, empsalary
}