import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcyrpt from "bcryptjs";
mongoose.connect("mongodb://127.0.0.1:27017",{
  dbName:"backend",
}).then((value)=>console.log("server is wroking mongo")).catch((e)=>console.log(e))
const app =express();

// making schema
const userSchema= mongoose.Schema({
  name:String,
  email:String,
  password:String,
})

const user = mongoose.model("User",userSchema);





// using middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const isauthanticated= async (req,res,next)=>{
  const {token}=req.cookies;
  if(token){
    const decoded=jwt.verify(token,"fieofeifei");
    req.user1 = await user.findById(decoded._id);
    next();
  }
  else{
    res.redirect("/login");
  }
}

app.set("view engine","ejs");
app.get("/",isauthanticated,(req,res)=>{
  res.render("logout",{name:req.user1.name});
 

})
app.get("/register",(req,res)=>{
  res.render("register");
 

})

app.post("/login",async (req,res)=>{
  const {email,password}=req.body;
  let user1 = await user.findOne({email})
  if(!user1) return res.redirect("/register");
  const ismatch = await bcyrpt.compare(password,user1.password); 
  if(!ismatch) return res.render("login",{email,message:"incorrect password!"});
  const token =jwt.sign({_id:user1._id},"fieofeifei");
  res.cookie("token",token , {httpOnly:true,expires:new Date(Date.now()+60*1000)});
  res.redirect("/");





})
app.post("/register",async (req,res)=>{
  const {name,email,password}=req.body;
let user1= await user.findOne({email});
if(user1){
 return res.redirect("/login");

}
const hashpssword = await bcyrpt.hash(password,10);
 user1= await user.create({name,email,password:hashpssword});
  console.log(req.body);
const token =jwt.sign({_id:user1._id},"fieofeifei");
console.log(token);


  res.cookie("token",token , {httpOnly:true,expires:new Date(Date.now()+60*1000)});
  res.redirect("/");



})
app.get("/login",(req,res)=>{
  res.render("login");
})
app.get("/logout",(req,res)=>{
  res.cookie("token",null,{httpOnly:true,expires:new Date(Date.now())});
  res.redirect("/");



})





app.listen(3000,()=>{
    console.log("server is working");
})