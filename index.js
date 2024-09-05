import express from "express";
import bodyParser from "body-parser";




const app = express();



app.use('/static', express.static('public'))


app.get("/" , (req, res)=>{
    res.render("home.ejs")
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


app.post("/profile" , (req,res)=>{
    res.render("profile.ejs")
})


app.get("/profile" , (req,res)=>{
    res.render("profile.ejs")
})


app.listen(3000 ,()=> {
    console.log("")
})