import express from "express";
import bodyParser from "body-parser";
import pg  from "pg"
import session from "express-session";

const app = express();

app.use('/static', express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
    secret:"18/10/2019", 
    resave:false ,
    saveUninitialized: true ,
    cookie : {
      maxAge:1000*60*10
    }
  }))





const date = new Date()
const year = date.getFullYear()

const db  = new pg.Client({
    password :"gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj" ,
    host:"dpg-crd1mqg8fa8c73bg324g-a", 
    database :"users_x5qf",
    user : "users_x5qf_user",
    port : 5432
  })
  




  

db.connect()


async function get_data (){const data =  await db.query("SELECT * FROM users"); }
 
let is_user = false
let stat_mess= "";



app.get("/" , async (req, res)=>{
    res.render("home.ejs");
})

app.get("/login", (req , res)=>{
    res.render("login.ejs")
})

app.get("/register", (req , res)=>{
    res.render("register.ejs")
})

app.get("/user-profile" , (req, res)=>{
      res.render("uers-profile.ejs");
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
  if(is_user){
    res.render("profile.ejs" , {date:year} )
  }else(res.redirect("/"))
})


app.post("/profile" , async (req,res)=>{
  try{
    const username = await db.query("select * from users where username = $1" , [req.body.username])
    if(username.rows[0].password===req.body.password){
      is_user = true
      res.render("profile.ejs" , {date:year})
    }else{
      res.redirect("/login")
    }
  }catch(err){
    console.error(err)
    res.redirect("/")
  }

})


app.post("/register" ,  async (req,res)=>{
    const email = req.body.username;
    const password = req.body.password;
    const profile_type = req.body.type
    console.log(profile_type.length)
    try{
      const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [email,]);

      if (checkResult.rows.length > 0) {
        stat_mess="email is alrady used , try to login or another email"
        res.render("register.ejs" , {mseeg:stat_mess});
      }else if (password.length < 8){
        stat_mess="The password must be more than 8 characters long"
        res.render("register.ejs" , {mseeg:stat_mess});
      }else if (profile_type.length<2){
        stat_mess="يرجى اختيار نوع حساب المستخدم"
        res.render("register.ejs" , {mseeg:stat_mess});
      }
      else{
        stat_mess="ligon is done"
        res.render("login.ejs" , {mseeg:stat_mess});
      }
    }catch(err){
      console.error(err)
      res.redirect("/register" )
    }
})






app.listen(3000 ,()=> {
    console.log("")
})