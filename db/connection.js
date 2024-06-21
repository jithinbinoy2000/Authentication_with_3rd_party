const mongoose = require('mongoose')
const db = process.env.database
mongoose.connect(db,{
    // UseUnidfiedTopology:true,
    // useNewUrlParse:true
}).then(()=>{
    console.log("Database is connected with mongoDB");
}).catch((error)=>{
    console.log("err",error);
})