// const multer = require("multer");

// const storage = multer.diskStorage({

//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },

//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },

// });


// const upload = multer({ storage });

// module.exports = upload;

const multer = require("multer")

const storage = multer.diskStorage({
    destination:"./uploads",
    filename:(req,file,cb)=>{
        cb(null, Date.now() + "-" + file.originalname)
    }
})
const upload = multer({
    storage:storage,
})
module.exports = upload