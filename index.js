import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import session from "express-session";
import {dirname} from "path";
import {fileURLToPath} from "url";
import fileUpload from "express-fileupload"
import multer from 'multer';
import {type} from "os";
import {render} from "ejs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static('public'));

app.use(session({
  secret: "18/10/2019",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 10
  }
}))

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const date = new Date()
const year = date.getFullYear()

const db  = new pg.Client({ 
        password :"gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj",
        host:"dpg-crd1mqg8fa8c73bg324g-a", 
        database :"users_x5qf", 
        user: "users_x5qf_user",
        port : 5432
         })

// const db = new pg.Client({password: "Ejc9c123", host: "localhost", database: " Authentication", user: "postgres", port: 5432})

db.connect()

async function get_data() {
  const data = await db.query("SELECT * FROM users");
}

let is_user = false
let user = {}
let stat_mess = "";

app.get("/", async(req, res) => {
  res.render("home.ejs")
})





app.post("/upload", async (req, res) => {
  const images = req.files.image;

  if (!images) {
    return res.redirect("/");
  }
  const imageArray = Array.isArray(images) ? images : [images];
  try {
    for (const image of imageArray) {
      const buffer = image.data;
      const name = image.name;
      const path = __dirname + "/public/upload_images/" + name;

      await db.query("INSERT INTO images(name, data) VALUES ($1, $2)", [name, buffer]);

      await image.mv(path);
    }

    res.send("Images uploaded successfully!");
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).send("An error occurred while uploading images.");
  }
});


app.get("/login", (req, res) => {
  res.render("login.ejs")
})

app.get("/register", (req, res) => {
  res.render("register.ejs")
})

app.get("/user-profile", (req, res) => {
  res.render("uers-profile.ejs");
})

app.get("/list", (req, res) => {
  res.render("list.ejs")
})

app.get("/profile", (req, res) => {
  if (is_user) {
    res.render("profile.ejs", {
      date: year,
      type: user.type,
      username: user.username
    })
  } else 
    (res.redirect("/"))
})

app.post("/profile", async(req, res) => {
  try {
    const username = await db.query("select * from users where username = $1", [req.body.username])
    if (username.rows[0].password === req.body.password) {
      is_user = true
      const result = await db.query("select type from users where username = $1", [req.body.username])
      const type = result.rows[0].type
      user = {
        username: username.rows[0].username,
        type: result.rows[0].type
      }
      res.render("profile.ejs", {
        date: year,
        type: type,
        username: username.rows[0].username
      })
    } else {
      res.redirect("/login")
    }
  } catch (err) {
    console.error(err)
    res.redirect("/")
  }

})

app.post("/register", async(req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const profile_type = req.body.type
  console.log(profile_type)
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [email]);
    if (checkResult.rows.length > 0) {
      stat_mess = "email is alrady used , try to login or another email"
      res.render("register.ejs", {mseeg: stat_mess});
    } else if (password.length < 8) {
      stat_mess = "The password must be more than 8 characters long"
      res.render("register.ejs", {mseeg: stat_mess});
    } else if (profile_type.length < 2) {
      stat_mess = "يرجى اختيار نوع حساب المستخدم"
      res.render("register.ejs", {mseeg: stat_mess});
    } else {
      try {
        const writing_data = await db.query("insert into users ( username , password , type) values ( $1 , $2 , $3)", [email, password, profile_type])
        stat_mess = "register is done"
        res.render("login.ejs", {mseeg: stat_mess});
      } catch (err) {
        console.error(err)
        res.redirect("/login")
      }
    }
  } catch (err) {
    console.error(err)
    res.redirect("/register")
  }
})

app.post("/uploaded_posts", (req, res) => {
  console.log(req.body.type)
  if (req.body.type === "user") 
    res.redirect("/profile")
})

app.post("/upload_post", (req, res) => {
  res.render("upload_post.ejs", {user: user})
})


app.get("/uploaded", async (req, res) => {
  try {
    // Fetch company information along with their images
    const result = await db.query(`
      SELECT ci.id, ci.company_name, ci.location, ci.number, ci.rating, ci.details, ci.username, ci2.image
      FROM company_info ci
      LEFT JOIN company_images ci2 ON ci.id = ci2.company_id
      WHERE ci.username = $1
    `, [user.username]);

    // Group images by company
    const companies = {};
    result.rows.forEach(row => {
      if (!companies[row.id]) {
        companies[row.id] = {
          id: row.id,
          company_name: row.company_name,
          location: row.location,
          number: row.number,
          rating: row.rating,
          details: row.details,
          username: row.username,
          images: []
        };
      }
      if (row.image) {
        companies[row.id].images.push(row.image.toString('base64'));
      }
    });

    // Convert the companies object to an array
    const companiesArray = Object.values(companies);

    res.render("list.ejs" , {companies:companiesArray});
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("An error occurred while fetching data.");
  }
});




app.post("/upload_new_post" ,  async (req , res)=>{

  const images = req.files.image;

  if (!images) {
    return res.redirect("/");
  }

  const imageArray = Array.isArray(images) ? images : [images];
  const { companyName, location, number, rating, details  } = req.body;
  
  try {
    // Insert company information
    const companyResult = await db.query(
      "INSERT INTO company_info (company_name, location, number, rating, details, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [companyName, location, number, rating, details, user.username]
    );

    const companyId = companyResult.rows[0].id;

    // Insert images
    for (const image of imageArray) {
      const buffer = image.data;
      const path = __dirname + "/public/upload_images/" + image.name;

      await db.query(
        "INSERT INTO company_images (company_id, image) VALUES ($1, $2)",
        [companyId, buffer]
      );
      await image.mv(path);
    }
    res.redirect("/uploaded");
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).send("An error occurred while uploading data.");
  }

})


app.get("/company/:id", async (req, res) => {
  const companyId = req.params.id;

  try {
    // Fetch company information
    const companyResult = await db.query("SELECT * FROM company_info WHERE id = $1", [companyId]);
    const company = companyResult.rows[0];

    // Fetch company images
    const imagesResult = await db.query("SELECT image FROM company_images WHERE company_id = $1", [companyId]);
    const images = imagesResult.rows.map(row => row.image.toString('base64'));

    // Combine company info and images
    const companyData = {
      ...company,
      images: images
    };

    res.render('post.ejs', { company: companyData });
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).send("An error occurred while fetching company details.");
  }
});



app.listen(3000 , ()=>{
  console.log("starting `node i index.js`")
})

