const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

//require config

const config = require("../config/config");

//randomString require

const randomstring = require("randomstring");

//convert password into hashing

const securePassword = async(password)=>{
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
        
    }
}


//for send mail
const sendVerifyMail = async(name,  email, user_id)=>{
    try {
        
        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure: false,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword

            }
        });
        const mailOptions = {
            from : config.emailUser,
            to:email,
            subject:'for Verication mail',
            html:'<p>hii '+name+', please click here to verify your mail <a href="http://localhost:3000/verify?id='+user_id+'"Verify</a>Your mail</p>'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been send:-",info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async( req, res)=>{
    try{

        res.render('registration',{message:''});

    }catch(error){
        console.log(error.message);
    }
}

const insertUser = async(req,res)=>{

    try {

        const spassword = await securePassword(req.body.password);
        const user = User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword
        });

        const userData = await user.save();

        if(userData){
            sendVerifyMail(req.body.name, req.body.email, userData._id );
            res.render('login',{message:"Your registration has been successfully!, please verify your mail"});
        }else{
            res.render('registration',{message:"Your registration has been failed!"});

        }
    } catch (error) {
        console.log(error.message);
    }
}
const verifyMail = async(req, res)=>{
    try {
        
       const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});

       console.log(updateInfo);
       res.render("login",{message:''});

    } catch (error) {
        console.log(error.message);
    }
}

//login user method strated

const loginLoad = async(req,res)=>{
    try {
        res.render('login',{message:''})
    } catch (error) {
        console.log(error);
    }
}

const verifyLogin = async(req , res)=>{
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        

        if (userData) {
            
           const passwordMatch = await bcrypt.compare(password,userData.password);
            if (passwordMatch) {
                
                if (userData.is_verified === 0) {
                    res.render('login',{message:"Please verify your mail"})
                } else {

                    req.session.user_id = userData.id;
                    res.redirect('/home');
                }

            } else {

            res.render('login', {message:"Email and password incorrect! "})
                
            }
        } else {

            res.render('login', {message:"Email and password incorrect! "})
        }

    } catch (error) {
        console.log(error.message);
    }
};

//for render home page

const loadHome = async(req,res)=>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        console.log(userData);

        res.render('home',{user:userData});
    } catch (error) {
        console.log(error.message);
    }
};

//for logout

const userLogout = async(req, res)=>{
    try {
        
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message)
    }
};

//forget password code

const forgetLoad = async(req,res)=>{
    try {
        
        res.render('forget',{message:''});

    } catch (error) {
        console.log(error.message);
    }
};

const forgetVerify = async(req, res)=>{
    try {
        
        const email = req.body.email;
        const userData = await User.findOne({email:email});

        if(userData){

            if(userData.is_verified ===0){
                res.render('forget', {message:"Please verify your mail"});

            }else{

                const randomString = randomstring.generate();
               const updatedData = await User.updateOne({email:email},{$set:{ token:randomString }});
               sendResetPasswordMail(userData.name, userData.email, randomString);
            res.render('forget', {message:"Please Check your mail to reset your password."});


            }

        }else{
            res.render('forget', {message:"User email is incorrect"});
        }

    } catch (error) {
        console.log(error.message);
    }
}

//for reset password send mail

const sendResetPasswordMail = async(name,  email, token)=>{
    try {
        
        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure: false,
            auth:{
                user:config.emailUser,
                pass:config.emailPassword

            }
        });
        const mailOptions = {
            from : config.emailUser,
            to:email,
            subject:'for Reset Password',
            html:'<p>hii '+name+', pleas click here to <a href="http://localhost:3000/forget-password?token='+token+'"Rest</a>Your password. </p>'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been send:-",info.response);
            }
        })

    } catch (error) {
        console.log(error.message);
    }
};

const forgetPasswordLoad = async(req,res)=>{
    try {
        
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});


        if (tokenData) {
            res.render('forget-password', {user_id:tokenData._id});
            
        } else {
            res.render('404', {message:"Token is invalid."});
        }

    } catch (error) {
        console.log(error.message);
    }
};


//for resetPasswoed method

const resetPassword = async(req, res)=>{
    try {
        
        const password = req.body.password;
        const user_id = req.body.user_id
        console.log(user_id,'line 280');


        const secure_password = await securePassword(password);
        
        await User.updateOne({_id:user_id.trim() },{ $set:{ password:secure_password , token:''}});
        // console.log(updatedData)

        res.redirect('/');


    } catch (error) {
        console.log(error.message)
    }
}
module.exports ={
     loadRegister,
     insertUser,
     verifyMail,
     loginLoad,
     verifyLogin,
     loadHome,
     userLogout,
     forgetLoad,
     forgetVerify,
     forgetPasswordLoad,
     resetPassword

}