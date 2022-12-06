const express = require("express");
const user_route = express();
const session = require("express-session");
const config = require("../config/config")
user_route.use(session({secret:config.sessionSecret}))

const auth = require("../middleware/auth");

user_route.set('view engine', 'ejs');
user_route.set('views','./views/users')

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

//require multer
const multer = require("multer");
const path = require("path");

const storege = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({storage:storege});

const userController = require("../controllers/userController");

user_route.get('/register',userController.loadRegister);

user_route.post('/register',upload.single('image'),userController.insertUser);

//for verify mail

user_route.get('/verify', userController.verifyMail);

//for login
user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);


//for dashbord page
user_route.get('/home',auth.isLogin,userController.loadHome);


//for logout
user_route.get('/logout',userController.userLogout);
user_route.use(express.static('public'));

//forget password
user_route.get('/forget',userController.forgetLoad);
user_route.post('/forget', userController.forgetVerify);

user_route.get('/forget-password', auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);





module.exports = user_route;
