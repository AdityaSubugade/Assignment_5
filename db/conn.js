const mongoose= require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/loginRegistration',{
    useNewUrlParser:true,
    useUnifiedTopology:true
    
})
    const db=mongoose.connection;
    db.on('error',(err)=>{throw err});
    db.once('open',()=>{console.log("database Connected")})


    