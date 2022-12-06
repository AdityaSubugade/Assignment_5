const express = require("express");
const app = express();
require("./db/conn");

//for user route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute);





app.listen(3000, function(){
    console.log("server is running...");  
})