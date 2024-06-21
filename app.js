require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
require('./db/connection')
const PORT = 6005;
const session = require('express-session')
const passport = require('passport')

const OAuth2Strategy = require('passport-google-oauth2').Strategy;
const userdb = require('./Model/userSchema')


// we are communicating with front end ... so detailing it
app.use(cors({
    origin:"http://localhost:5173",
    methods:'GET,POST,PUT,DELETE',
    credentials:true
}));

app.use(express.json());



//setup session  
//after login will generate google session
//use to validate user
//will generte unique key
// While sessions are used to maintain authentication state, they can also be used by applications to maintain other state unrelated to authentication. Passport is carefully designed to isolate authentication state, referred to as a login session, from other state that may be stored in the session.
app.use(session({
    secret:'test',
    resave:false, //resave Forces the session to be saved back to the session store, even if the session wasn't modified
    saveUninitialized:true
}));//will create an encrypted id



//setup passport
app.use(passport.initialize());
      //passport session 
app.use(passport.session());
  //using auth straragy
passport.use(
    new OAuth2Strategy({
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL:'/auth/google/callback',
        scope:['profile',"email"]
    },//callback function
 async(accessToken,refreshToken,profile,done)=>{
    // console.log(profile);
    try{//find existing user
        let user = await userdb.findOne({googleId:profile.id})
        if(!user){//save new user
            user = new userdb({
                googleId:profile.id,
                displayName:profile.displayName,
                email:profile.email[0].value,
                image:profile.picture[0].value
            })
            await user.save()
        }
   return done(null,user)
    }catch(error){
        return done(error,null)
    }
 }
)
)


//got user details now decript the data 
//we used passport session 
//Registers a function used to serialize user objects into the session.
passport.serializeUser((user,done)=>{
    done(null,user)
});
passport.deserializeUser((user,done)=>{
    done(null,user)
});
    

//intitailes google auth login
//http://localhost:6005/auth/google/callback
app.get("/google",passport.authenticate("google",{scope:["profile",["email"]]},console.log("google auth")))

app.get("/auth/google/callback",passport.authenticate('google',{
    //success redirect to url
    successRedirect:'http://localhost:5173/dashboard',
    //failure login
    failureRedirect:'http://localhost:5173/login'
}))



// logic for get user data on api call
app.get('/login/sucess',async(req,res)=>{
    console.log("reqqq",req); //if req.user loggin
    if(req.user){ 
        res.status(200).json({message:"User Login Successfull",user:req.user})
    }
    else{
        res.status(400).json({message:"Not Authoutherised User"})
    
    }
})

//api call for logout (middleware)
app.get('/logout',(req,res,next)=>{
    req.logout(function(err){
        if(err){return next(err)}
        res.redirect("http://localhost:5173")
    })
})


//server run
app.get("/",(req,res)=>{   
    res.status(200).json("server startted")
});
app.listen(PORT,()=>{
    console.log(`server started at pot no ${PORT}`);
});
