import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import session from "express-session";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fileUpload from "express-fileupload"
import multer from 'multer';
import { type } from "os";
import { render } from "ejs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
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
const upload = multer({ storage: storage });

const date = new Date()
const year = date.getFullYear()

const db = new pg.Client({
  user: "users_x5qf_user",
  host: "dpg-crd1mqg8fa8c73bg324g-a.oregon-postgres.render.com",
  port: 5432,
  password: "gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj",
  database: "users_x5qf",
  ssl: {
    rejectUnauthorized: false
  }
});


// const db = new pg.Client({ password: "Ejc9c123", host: "localhost", database: " Authentication", user: "postgres", port: 5432 })

db.connect()

async function get_data() {
  const data = await db.query("SELECT * FROM users");
}
let is_user = false
let user = {}
let stat_mess = "";

app.get("/", async (req, res) => {
  try {
    const companyResult = await db.query(`
      SELECT ci.id, ci.company_name, ci.location, ci.number, ci.rating, ci.details, ci.username, ci.title, ci2.image
      FROM company_info ci
      LEFT JOIN company_images ci2 ON ci.id = ci2.company_id
    `);

    const companies = {};
    companyResult.rows.forEach(row => {
      if (!companies[row.id]) {
        companies[row.id] = {
          id: row.id,
          name: row.company_name,
          location: row.location,
          number: row.number,
          rating: row.rating,
          details: row.details,
          username: row.username,
          title: row.title,
          images: []
        };
      }
      if (row.image) {
        companies[row.id].images.push(row.image.toString('base64'));
      }
    });

    const companiesArray = Object.values(companies);
    const randomCompanies = [];
    const totalCompanies = companiesArray.length;

    for (let i = 0; i < 4 && i < totalCompanies; i++) {
      const randomIndex = Math.floor(Math.random() * companiesArray.length);
      randomCompanies.push(companiesArray.splice(randomIndex, 1)[0]);
    }

    try {
      const contractorResult = await db.query(`
        SELECT ci.id, ci.name, ci.location, ci.number, ci.details, ci.username,ci.title , ci2.image
        FROM contractor_info ci
        LEFT JOIN contractor_images ci2 ON ci.id = ci2.contractor_id
      `);
      const contractors = {};
      contractorResult.rows.forEach(row => {
        if (!contractors[row.id]) {
          contractors[row.id] = {
            id: row.id,
            name: row.name,
            location: row.location,
            number: row.number,
            details: row.details,
            username: row.username,
            title: row.title,
            images: []
          };
        }
        if (row.image) {
          contractors[row.id].images.push(row.image.toString('base64'));
        }
      });
      const contractorsArray = Object.values(contractors);
      const randomContractor = [];
      const totalContractor = contractorsArray.length;
      for (let i = 0; i < 4 && i < totalContractor; i++) {
        const randomIndex = Math.floor(Math.random() * contractorsArray.length);
        randomContractor.push(contractorsArray.splice(randomIndex, 1)[0]);
      }

      console.log(randomContractor)
      await res.render("profile.ejs", {
        date: year,
        username: user.username,
        companies: randomCompanies,
        contractors: randomContractor,
        type: user.type,
        is_user: is_user,
        num: 4 - (randomContractor.length),
        Cnum: 4 - (randomCompanies.length)
      });

    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})



app.post("/profile", async (req, res) => {
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
      res.redirect("/")
    } else {
      res.redirect("/login")
    }
  } catch (err) {
    console.error(err)
    res.redirect("/")
  }

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
      await db.query("INSERT INTO images(name, data) VALUES ($1, $2)", [name, buffer]);
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





app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const profile_type = req.body.type
  console.log(profile_type)
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [email]);
    if (checkResult.rows.length > 0) {
      stat_mess = "email is alrady used , try to login or another email"
      res.render("register.ejs", { mseeg: stat_mess });
    } else if (password.length < 8) {
      stat_mess = "The password must be more than 8 characters long"
      res.render("register.ejs", { mseeg: stat_mess });
    } else if (profile_type.length < 2) {
      stat_mess = "يرجى اختيار نوع حساب المستخدم"
      res.render("register.ejs", { mseeg: stat_mess });
    } else {
      try {
        const writing_data = await db.query("insert into users ( username , password , type) values ( $1 , $2 , $3)", [email, password, profile_type])
        stat_mess = "register is done"
        res.render("login.ejs", { mseeg: stat_mess });
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




let list_of_type = ""

app.post("/upload_post", (req, res) => {
  list_of_type = req.body.upload_type;
  console.log(user.username)
  res.render("upload_post.ejs", { user: user.username, list_type: req.body.upload_type })
})


app.post("/upload_new_post", async (req, res) => {
  const images = req.files.image;

  if (!images) {
    return res.redirect("/");
  }

  const imageArray = Array.isArray(images) ? images : [images];
  const { companyName, location, number, details, list_type, title } = req.body;

  try {
    if (list_type === 'freelancer') {
      // Insert freelancer information
      const freelancerResult = await db.query(
        "INSERT INTO freelancer_info (name, location, number, details, username , title) VALUES ($1, $2, $3, $4, $5 ,$6) RETURNING id",
        [companyName, location, number, details, user.username, title]
      );

      const freelancerId = freelancerResult.rows[0].id;

      // Insert images for freelancer
      for (const image of imageArray) {
        const buffer = image.data;
        await db.query(
          "INSERT INTO freelancer_images (freelancer_id, image) VALUES ($1, $2)",
          [freelancerId, buffer]
        );
      }
    } else if (list_type === 'contractor') {
      // Insert contractor information
      const contractorResult = await db.query(
        "INSERT INTO contractor_info (name, location, number, details, username , title) VALUES ($1, $2, $3, $4, $5 ,$6) RETURNING id",
        [companyName, location, number, details, user.username, title]
      );

      const contractorId = contractorResult.rows[0].id;

      // Insert images for contractor
      for (const image of imageArray) {
        const buffer = image.data;

        await db.query(
          "INSERT INTO contractor_images (contractor_id, image) VALUES ($1, $2)",
          [contractorId, buffer]
        );
      }
    } else {
      // Insert company information
      const companyResult = await db.query(
        "INSERT INTO company_info (company_name, location, number, details, username , title) VALUES ($1, $2, $3, $4, $5 ,$6) RETURNING id",
        [companyName, location, number, details, user.username, title]
      );

      const companyId = companyResult.rows[0].id;

      // Insert images for company
      for (const image of imageArray) {
        const buffer = image.data;

        await db.query(
          "INSERT INTO company_images (company_id, image) VALUES ($1, $2)",
          [companyId, buffer]
        );
      }
    }
    res.redirect("/uploaded");
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).send("An error occurred while uploading data.");
  }
});




app.get("/uploaded", async (req, res) => {
  const type = list_of_type
  try {
    if (type === "engeneering") {
      try {
        const companyResult = await db.query(`
      SELECT ci.id, ci.company_name, ci.location, ci.number, ci.rating, ci.details, ci.username, ci.title , ci2.image
      FROM company_info ci
      LEFT JOIN company_images ci2 ON ci.id = ci2.company_id
    `);

        const companies = {};
        companyResult.rows.forEach(row => {
          if (!companies[row.id]) {
            companies[row.id] = {
              id: row.id,
              name: row.company_name,
              location: row.location,
              number: row.number,
              rating: row.rating,
              details: row.details,
              username: row.username,
              title: row.title,
              images: []
            };
          }
          if (row.image) {
            companies[row.id].images.push(row.image.toString('base64'));
          }
        });

        const companiesArray = Object.values(companies);
        res.render("list.ejs", { companies: companiesArray, type: list_of_type });
      } catch (err) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }

    } else if (type === "contractor") {
      try {
        const contractorResult = await db.query(`
        SELECT ci.id, ci.name, ci.location, ci.number, ci.details, ci.username,ci.title , ci2.image
        FROM contractor_info ci
        LEFT JOIN contractor_images ci2 ON ci.id = ci2.contractor_id
        
      `);
        const contractors = {};
        contractorResult.rows.forEach(row => {
          if (!contractors[row.id]) {
            contractors[row.id] = {
              id: row.id,
              name: row.name,
              location: row.location,
              number: row.number,
              details: row.details,
              username: row.username,
              title: row.title,
              images: []
            };
          }
          if (row.image) {
            contractors[row.id].images.push(row.image.toString('base64'));
          }
        });
        const contractorsArray = Object.values(contractors);
        res.render("list.ejs", { companies: contractorsArray, type: list_of_type });
      } catch (err) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }
    } else {


      try {
        const freelancerResult = await db.query(`
      SELECT fi.id, fi.name, fi.location, fi.number, fi.details, fi.username, fi.title , fi2.image
      FROM freelancer_info fi
      LEFT JOIN freelancer_images fi2 ON fi.id = fi2.freelancer_id
      WHERE fi.username = $1
    `, [user.username]);

        const freelancers = {};
        freelancerResult.rows.forEach(row => {
          if (!freelancers[row.id]) {
            freelancers[row.id] = {
              id: row.id,
              name: row.name,
              location: row.location,
              number: row.number,
              details: row.details,
              username: row.username,
              title: row.title,
              images: []
            };
          }
          if (row.image) {
            freelancers[row.id].images.push(row.image.toString('base64'));
          }
        });
        const freelancersArray = Object.values(freelancers);
        res.render("list.ejs", { companies: freelancersArray, type: list_of_type });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }
    }
  } catch (err) {
    console.error(err)
  }
});


app.post("/uploaded", async (req, res) => {
  try {
    if (req.body.upload_type === "engeneering") {
      try {
        const companyResult = await db.query(`
      SELECT ci.id, ci.company_name, ci.location, ci.number, ci.rating, ci.details, ci.username,ci.title , ci2.image
      FROM company_info ci
      LEFT JOIN company_images ci2 ON ci.id = ci2.company_id
     
    `);

        const companies = {};
        companyResult.rows.forEach(row => {
          if (!companies[row.id]) {
            companies[row.id] = {
              id: row.id,
              name: row.company_name,
              location: row.location,
              number: row.number,
              rating: row.rating,
              details: row.details,
              username: row.username,
              title: row.title,
              images: []
            };
          }
          if (row.image) {
            companies[row.id].images.push(row.image.toString('base64'));
          }
        });

        const companiesArray = Object.values(companies);
        res.render("list.ejs", { companies: companiesArray, type: req.body.upload_type });
      } catch (err) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }

    } else if (req.body.upload_type === "contractor") {
      try {
        const contractorResult = await db.query(`
        SELECT ci.id, ci.name, ci.location, ci.number, ci.details, ci.username,ci.title , ci2.image
        FROM contractor_info ci
        LEFT JOIN contractor_images ci2 ON ci.id = ci2.contractor_id
       
      `);
        const contractors = {};
        contractorResult.rows.forEach(row => {
          if (!contractors[row.id]) {
            contractors[row.id] = {
              id: row.id,
              name: row.name,
              location: row.location,
              number: row.number,
              details: row.details,
              username: row.username,
              title: row.title,
              images: []
            };
          }
          if (row.image) {
            contractors[row.id].images.push(row.image.toString('base64'));
          }
        });
        const contractorsArray = Object.values(contractors);
        res.render("list.ejs", { companies: contractorsArray, type: req.body.upload_type });
      } catch (err) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }
    } else {
      try {
        const freelancerResult = await db.query(`
      SELECT fi.id, fi.name, fi.location, fi.number, fi.details, fi.username, fi.title ,fi2.image
      FROM freelancer_info fi
      LEFT JOIN freelancer_images fi2 ON fi.id = fi2.freelancer_id
    `);

        const freelancers = {};
        freelancerResult.rows.forEach(row => {
          if (!freelancers[row.id]) {
            freelancers[row.id] = {
              id: row.id,
              name: row.name,
              location: row.location,
              number: row.number,
              details: row.details,
              username: row.username,
              title: row.title,
              images: []
            };
          }
          if (row.image) {
            freelancers[row.id].images.push(row.image.toString('base64'));
          }
        });
        const freelancersArray = Object.values(freelancers);
        res.render("list.ejs", { companies: freelancersArray, type: req.body.upload_type });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("An error occurred while fetching data.");
      }
    }
  } catch (err) {
    console.error(err)
  }
});

app.get("/post/:type/:id", async (req, res) => {
  const id = req.params.id;
  const type = req.params.type; // Assuming type is passed as a query parameter

  try {
    let result, imagesResult, data;

    if (type === "engeneering") {
      // Fetch company information
      result = await db.query("SELECT * FROM company_info WHERE id = $1", [id]);
      data = result.rows[0];

      // Fetch company images
      imagesResult = await db.query("SELECT image FROM company_images WHERE company_id = $1", [id]);
    } else if (type === "contractor") {
      // Fetch contractor information
      result = await db.query("SELECT * FROM contractor_info WHERE id = $1", [id]);
      data = result.rows[0];

      // Fetch contractor images
      imagesResult = await db.query("SELECT image FROM contractor_images WHERE contractor_id = $1", [id]);
    } else {
      // Fetch freelancer information
      result = await db.query("SELECT * FROM freelancer_info WHERE id = $1", [id]);
      data = result.rows[0];
      // Fetch freelancer images
      imagesResult = await db.query("SELECT image FROM freelancer_images WHERE freelancer_id = $1", [id]);

    }

    const images = imagesResult.rows.map(row => row.image.toString('base64'));

    // Combine info and images
    const combinedData = {
      ...data,
      images: images
    };
    console.log(combinedData)
    console.log(images)
    console.log()
    res.render('post.ejs', { data: combinedData, type: type });
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).send("An error occurred while fetching details.");
  }
});






app.listen(3000, () => {
  console.log("starting `node i index.js`")
})

