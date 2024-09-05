import express from "express";
import bodyParser from "body-parser";
import pg  from "pg"
const app = express();

app.use('/static', express.static('public'))

const db  = new pg.Client({
    password :"gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj" ,
    host:"dpg-crd1mqg8fa8c73bg324g-a", 
    database :"users_x5qf",
    user : "users_x5qf_user",
    port : 5432
  })
  

db.connect()


async function get_data (){
    const data =  await db.query("SELECT * FROM users"); 
 }
 


app.get("/" , async (req, res)=>{
    const data =  await db.query("SELECT * FROM users");
    res.send(data)
})

app.get("/login", (req , res)=>{
    res.render("login.ejs")
})

app.get("/register", (req , res)=>{
    res.render("register.ejs")
})

app.get("/uers-profile.ejs" , (req, res)=>{
    res.render("uers-profile.ejs")
})



app.get("/list_1" , (req,res)=>{
    res.render("list_1.ejs")
})

app.get("/list_2" , (req,res)=>{
    res.render("list_2.ejs")
})


app.get("/list" , (req,res)=>{
    res.render("list.ejs")
})


app.get("/profile" , (req,res)=>{
    res.render("profile.ejs")
})


app.post("/profile" , (req,res)=>{
    res.render("profile.ejs")
})


app.post("/register" , (req,res)=>{

    res.redirect("login.ejs")
})


app.post("/login" , (req,res)=>{

    res.render("login.ejs")
})


app.listen(3000 ,()=> {
    console.log("")
})
