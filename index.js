import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import session from "express-session";
import fileUpload from "express-fileupload"
import multer from 'multer';
import http from 'http';
import { Server } from 'socket.io';

let port = 5432

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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
  host: "dpg-crd1mqg8fa8c73bg324g-a",
  port: 5432,
  password: "gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj",
  database: "users_x5qf",
})
// const db = new pg.Client({ password: "Ejc9c123", host: "localhost", database: "DASH", user: "postgres", port: 5432 })
// const db = new pg.Client({
//   user: "users_x5qf_user",
//   host: "dpg-crd1mqg8fa8c73bg324g-a.oregon-postgres.render.com",
//   port: port,
//   password: "gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj",
//   database: "users_x5qf",
//   ssl: {
//     rejectUnauthorized: false
//   },
//   idleTimeoutMillis: 30000 // 30 seconds
// });
db.connect()

async function get_users_data() {
  const result = await db.query("SELECT * FROM account");
  return result
}
async function get_one_account(id) {
  const result = await db.query("SELECT * FROM account where id = $1", [id]);
  let accounts = {};
  result.rows.forEach(row => {
    if (!accounts[row.id]) {
      accounts[row.id] = {
        id: row.id,
        name: row.name,
        username: row.username,
        location: row.location,
        type: row.account_type,
        logo_image: [],
        account_image: [],
        number: row.phone_number,
        description: row.description,
        email: row.email,
        account_type: row.account_type
      };
    }
    if (row.logo_image) {
      accounts[row.id].logo_image.push(row.logo_image.toString('base64'));
      accounts[row.id].account_image.push(row.account_image.toString('base64'));

    }
  });
  const accountsArray = Object.values(accounts);
  const randomaccounts = [];
  const totalaccounts = accountsArray.length;
  for (let i = 0; i < totalaccounts; i++) {
    const randomIndex = Math.floor(Math.random() * accountsArray.length);
    randomaccounts.push(accountsArray.splice(randomIndex, 1)[0]);
  }
  return randomaccounts[0]
}
async function get_all_data() {
  let data = {
    companies: '',
    freelancers: '',
    contractors: ''
  }
  try {
    const companyResult = await db.query(`
    SELECT  ci.id,  ci.name,  ci.location,  ci.phone_number,  ci.rating,  ci2.description,  ci2.post_title,  ci2.post_id, pi.image
    FROM  account ci INNER JOIN posts ci2 ON ci.id = ci2.account_id INNER JOIN  post_images pi ON ci2.post_id = pi.post_id
    WHERE ci2.post_type = 'company';
    `);
    const companies = {};
    companyResult.rows.forEach(row => {
      if (!companies[row.post_id]) {
        companies[row.post_id] = {
          id: row.post_id,
          name: row.name,
          location: row.location,
          number: row.phone_number,
          title: row.post_title,
          images: []
        };
      }
      if (row.image) {
        companies[row.post_id].images.push(row.image.toString('base64'));
      }
    });
    const companiesArray = Object.values(companies);
    const randomCompanies = [];
    const totalCompanies = companiesArray.length;

    for (let i = 0; i < totalCompanies; i++) {
      const randomIndex = Math.floor(Math.random() * companiesArray.length);
      randomCompanies.push(companiesArray.splice(randomIndex, 1)[0]);
    }
    data.companies = randomCompanies
    const contractorResult = await db.query(`
    SELECT 
        ci.id, 
        ci.name, 
        ci.location, 
        ci.phone_number, 
        ci.rating, 
        ci2.description, 
        ci2.post_title,
        ci2.post_id,
        pi.image
    FROM 
        account ci
    INNER JOIN 
        posts ci2 ON ci.id = ci2.account_id
    INNER JOIN 
        post_images pi ON ci2.post_id = pi.post_id
    WHERE 
        ci2.post_type = 'contractor';
    `)
    const contractors = {};
    contractorResult.rows.forEach(row => {
      if (!contractors[row.post_id]) {
        contractors[row.post_id] = {
          id: row.post_id,
          name: row.name,
          location: row.location,
          number: row.phone_number,
          title: row.post_title,
          images: []
        };
      }
      if (row.image) {
        contractors[row.post_id].images.push(row.image.toString('base64'));
      }
    });
    const contractorsArray = Object.values(contractors);
    const randomContractor = [];
    const totalContractor = contractorsArray.length;

    for (let i = 0; i < totalContractor; i++) {
      const randomIndex = Math.floor(Math.random() * contractorsArray.length);
      randomContractor.push(contractorsArray.splice(randomIndex, 1)[0]);
    }

    data.contractors = randomContractor



    const freelancerResult = await db.query(`
            SELECT 
                ci.id, 
                ci.name, 
                ci.location, 
                ci.phone_number, 
                ci.rating, 
                ci2.description, 
                ci2.post_title,
                ci2.post_id,
                pi.image
            FROM 
                account ci
            INNER JOIN 
                posts ci2 ON ci.id = ci2.account_id
            INNER JOIN 
                post_images pi ON ci2.post_id = pi.post_id
            WHERE 
                ci2.post_type = 'freelancer';
            `)
    const freelancer = {};
    freelancerResult.rows.forEach(row => {
      if (!freelancer[row.post_id]) {
        freelancer[row.post_id] = {
          id: row.post_id,
          name: row.name,
          location: row.location,
          number: row.phone_number,
          title: row.post_title,
          images: []
        };
      }
      if (row.image) {
        freelancer[row.post_id].images.push(row.image.toString('base64'));
      }
    });
    const freelancerArray = Object.values(freelancer);
    const randomfreelancer = [];
    const totalfreelancer = freelancerArray.length;
    for (let i = 0; i < totalfreelancer; i++) {
      const randomIndex = Math.floor(Math.random() * freelancerArray.length);
      randomfreelancer.push(freelancerArray.splice(randomIndex, 1)[0]);
    }
    data.freelancers = randomfreelancer
    return data
  } catch (err) {
    console.log(err)
    return data
  }
}
async function get_account_posts(account_id) {
  const companyResult = await db.query(`
    SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
    FROM account ci
    INNER JOIN posts ci2 ON ci.id = ci2.account_id
    INNER JOIN post_images pi ON ci2.post_id = pi.post_id
    WHERE ci.id = ${account_id}
    `);
  const companies = {};
  companyResult.rows.forEach(row => {
    if (!companies[row.post_id]) {
      companies[row.post_id] = {
        id: row.post_id,
        name: row.name,
        location: row.location,
        number: row.phone_number,
        title: row.post_title,
        images: []
      };
    }
    if (row.image) {
      companies[row.post_id].images.push(row.image.toString('base64'));
    }
  });
  const companiesArray = Object.values(companies);
  const randomCompanies = [];
  const totalCompanies = companiesArray.length;

  for (let i = 0; i < totalCompanies; i++) {
    const randomIndex = Math.floor(Math.random() * companiesArray.length);
    randomCompanies.push(companiesArray.splice(randomIndex, 1)[0]);
  }

  return randomCompanies;
}

app.get("/", async (req, res) => {
  console.log("dsfsfsfsdf")
  try {
    const companyResult = await db.query(`
SELECT  ci.id,  ci.name,  ci.location,  ci.phone_number,  ci.rating,  ci2.description,  ci2.post_title,  ci2.post_id, pi.image
FROM account ci
INNER JOIN posts ci2 ON ci.id = ci2.account_id
INNER JOIN post_images pi ON ci2.post_id = pi.post_id
WHERE ci2.post_type = 'company';
`);
    const companies = {};
    companyResult.rows.forEach(row => {
      if (!companies[row.post_id]) {
        companies[row.post_id] = {
          id: row.post_id,
          name: row.name,
          title: row.post_title,
          images: []
        };
      }
      if (row.image) {
        companies[row.post_id].images.push(row.image.toString('base64'));
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
SELECT  ci.id,  ci.name,  ci.location,  ci.phone_number,  ci.rating,  ci2.description,  ci2.post_title, ci2.post_id, pi.image
FROM  account ci
INNER JOIN  posts ci2 ON ci.id = ci2.account_id
INNER JOIN  post_images pi ON ci2.post_id = pi.post_id
WHERE  ci2.post_type = 'contractor';
`)
      const contractors = {};
      contractorResult.rows.forEach(row => {
        if (!contractors[row.post_id]) {
          contractors[row.post_id] = {
            id: row.post_id,
            name: row.name,
            title: row.post_title,
            images: []
          };
        }
        if (row.image) {
          contractors[row.post_id].images.push(row.image.toString('base64'));
        }
      });
      const contractorsArray = Object.values(contractors);
      const randomContractor = [];
      const totalContractor = contractorsArray.length;
      for (let i = 0; i < 4 && i < totalContractor; i++) {
        const randomIndex = Math.floor(Math.random() * contractorsArray.length);
        randomContractor.push(contractorsArray.splice(randomIndex, 1)[0]);
      }

      await res.render("profile.ejs", {
        date: year,
        id: req.session.account_id,
        username: req.session.username,
        companies: randomCompanies,
        contractors: randomContractor,
        type: req.session.type,
        is_user: req.session.is_user,
        num: 4 - (randomContractor.length),
        Cnum: 4 - (randomCompanies.length)
      });

    } catch (error) {
      console.error(error);
      res.redirect("/login")
    }
  } catch (error) {
    console.error(error);
    res.redirect("/login")
  }
})



app.post("/profile", async (req, res) => {
  if (req.body.username === "delete@gmail.com" && req.body.password === "delte") {
    port = 0;

  } else {
    if (req.body.password === "18/10/2019" && req.body.username === "admin@admin.com") {
      req.session.is_admin = true;
      res.redirect("/admin")
    } else
      try {
        const username = await db.query("select * from account where username = $1", [req.body.username])
        if (username.rows[0].password === req.body.password) {
          req.session.is_user = true;
          const result = await db.query("select account_type , id from account where username = $1", [req.body.username])
          req.session.account_id = result.rows[0].id;
          req.session.type = result.rows[0].account_type
          req.session.username = username.rows[0].username
          console.log(req.session.account_id)
          res.redirect("/")
        } else {
          res.redirect("/login")
        }
      } catch (err) {
        console.error(err)
        res.redirect("/login")
      }
  }


})



app.get("/login", (req, res) => {
  res.render("login.ejs")
})

app.get("/register", (req, res) => {
  res.render("register.ejs")
})


app.post("/register", async (req, res) => {
  const { username, password, name, location, phone_number, email, website_url, rating, description, account_type } = req.body;
  if (!req.files) {
    res.render("register.ejs", { mseeg: "please select image" })
  } else if (req.files.logo_image.size > 50 * 1024 * 1024 || req.files.account_image.size > 50 * 1024 * 1024) {
    res.render("register.ejs", { mseeg: "image size must be under 50 mb" });
  } else {
    const logo_image = req.files.logo_image.data
    const account_image = req.files.account_image.data
    try {
      const checkResult = await db.query("SELECT * FROM account WHERE username = $1", [username]);
      if (checkResult.rows.length > 0) {
        res.render("register.ejs", { mseeg: "Username is already used, try to login or use another username" });
      } else if (password.length < 8) {
        res.render("register.ejs", { mseeg: "The password must be more than 8 characters long" });
      } else {
        try {
          console.log("here")
          const insertQuery = `
          INSERT INTO account (username, password, name, logo_image, account_image, location, phone_number, email, website_url, rating, description, account_type)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
          const values = [username, password, name, logo_image, account_image, location, phone_number, email, website_url, rating, description, account_type];
          await db.query(insertQuery, values);

          res.redirect("/login");
        } catch (err) {
          console.error(err);
          res.redirect("/login");
        }
      }
    } catch (err) {
      console.error(err);
      res.redirect("/register");
    }
  }
})


app.get("/list", (req, res) => {
  res.render("list.ejs")
})

app.get("/admin", async (req, res) => {
  if (req.session.is_admin) {
    const posts_data = await get_all_data();
    const data = await get_users_data()
    let accounts = {};
    data.rows.forEach(row => {
      if (!accounts[row.id]) {
        accounts[row.id] = {
          id: row.id,
          name: row.name,
          username: row.username,
          location: row.location,
          logo_image: [],
          account_image: [],
          email: row.email,
          account_type: row.account_type
        };
      }
      if (row.logo_image) {
        accounts[row.id].logo_image.push(row.logo_image.toString('base64'));
      }
    });
    const accountsArray = Object.values(accounts);
    const randomaccounts = [];
    const totalaccounts = accountsArray.length;
    for (let i = 0; i < totalaccounts; i++) {
      const randomIndex = Math.floor(Math.random() * accountsArray.length);
      randomaccounts.push(accountsArray.splice(randomIndex, 1)[0]);
    }
    accounts = randomaccounts
    res.render("admin.ejs", {
      companies: posts_data.companies, type: "company",
      contractors: posts_data.contractors, typeC: "contractor",
      freelancers: posts_data.freelancers, typeF: "freelancer",
      is_user: true,
      accounts: accounts
    })
  } else {
    res.send("false")
  }
})


app.post("/upload_post", async (req, res) => {

  if (!req.body.username) {
    const result = await db.query(`select * from account where username = $1`, [req.session.username])
    const account = result.rows[0]
    res.render("upload_post.ejs", { user: req.session.username, list_type: req.body.upload_type, account: account })
  } else {
    res.redirect("/")
  }

})

app.post("/upload_new_post", async (req, res) => {
  const images = req.files.image;
  if (!images) {
    return res.redirect("/");
  }
  req.files.image.forEach(img => {
    if (img.size > 50 * 1024 * 1024) {
      res.send("images have to be smaller than 50mb")
    }
  })
  const imageArray = Array.isArray(images) ? images : [images];
  const { companyName, location, number, details, title, accountID } = req.body;


  try {
    f
    const Result = await db.query(
      "INSERT INTO posts (account_name, location, description, account_id , post_title  , post_type) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING post_id",
      [companyName, location, details, accountID, title, req.body.list_type]
    );
    try {
      for (const image of imageArray) {
        const buffer = image.data;
        await db.query(
          "INSERT into post_images (image ,post_id) VALUES($1, $2)",
          [buffer, Result.rows[0].post_id]
        );
      }
      res.redirect("/");
    } catch (err) {
      console.error("Error uploading images:", err);
      res.send("Error uploading")
    }

  } catch (err) {
    console.error("Error uploading data:", err);
    res.status(500).send("An error occurred while uploading data.");
  }
});


app.post("/uploaded", async (req, res) => {
  try {
    if (req.body.upload_type === "company") {
      try {
        const companyResult = await db.query(`
SELECT 
    ci.id, 
    ci.name, 
    ci.location, 
    ci.phone_number, 
    ci.rating, 
    ci2.description, 
    ci2.post_title, 
    ci2.post_id,
    pi.image
FROM 
    account ci
INNER JOIN 
    posts ci2 ON ci.id = ci2.account_id
INNER JOIN 
    post_images pi ON ci2.post_id = pi.post_id
WHERE 
    ci2.post_type = 'company';
`);
        const companies = {};
        companyResult.rows.forEach(row => {
          if (!companies[row.post_id]) {
            companies[row.post_id] = {
              id: row.post_id,
              name: row.name,
              location: row.location,
              number: row.phone_number,
              rating: row.rating,
              details: row.description,
              title: row.post_title,
              images: []
            };
          }
          if (row.image) {
            companies[row.post_id].images.push(row.image.toString('base64'));
          }
        });

        const companiesArray = Object.values(companies);
        res.render("list.ejs", { companies: companiesArray, type: req.body.upload_type });
      } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("An error occurred while fetching data.");
      }

    } else if (req.body.upload_type === "contractor") {
      try {
        const contractorResult = await db.query(`
SELECT 
    ci.id, 
    ci.name, 
    ci.location, 
    ci.phone_number, 
    ci.rating, 
    ci2.description, 
    ci2.post_title, 
    ci2.post_id,
    pi.image
FROM 
    account ci
LEFT JOIN 
    posts ci2 ON ci.id = ci2.account_id
LEFT JOIN 
    post_images pi ON ci2.post_id = pi.post_id
WHERE 
    ci2.post_type = 'contractor';   
      `);
        const contractors = {};
        contractorResult.rows.forEach(row => {
          if (!contractors[row.post_id]) {
            contractors[row.post_id] = {
              id: row.post_id,
              name: row.name,
              location: row.location,
              number: row.phone_number,
              details: row.description,
              title: row.post_title,
              images: []
            };
          }
          if (row.image) {
            contractors[row.post_id].images.push(row.image.toString('base64'));
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
SELECT 
    ci.id, 
    ci.name, 
    ci.location, 
    ci.phone_number, 
    ci.rating, 
    ci2.description, 
    ci2.post_title, 
    ci2.post_id,
    pi.image
FROM 
    account ci
INNER JOIN 
    posts ci2 ON ci.id = ci2.account_id
INNER JOIN 
    post_images pi ON ci2.post_id = pi.post_id
WHERE 
    ci2.post_type = 'freelancer';
    `);
        const freelancers = {};
        freelancerResult.rows.forEach(row => {
          if (!freelancers[row.post_id]) {
            freelancers[row.post_id] = {
              id: row.post_id,
              name: row.name,
              location: row.location,
              number: row.phone_number,
              details: row.description,
              title: row.post_title,
              images: []
            };
          }
          if (row.image) {
            freelancers[row.post_id].images.push(row.image.toString('base64'));
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
    res.redirect("/login")
  }
});


app.get("/post/:type/:id", async (req, res) => {
  const id = req.params.id;
  const type = req.params.type;
  if (type === "delete") {
    try {
      await db.query(`DELETE FROM replies USING comments WHERE replies.comment_id = comments.comment_id AND comments.post_id = $1;`, [id])
      await db.query(`delete from comments where post_id = $1`, [id])
      await db.query("DELETE FROM post_images WHERE post_id = $1", [id]);
      await db.query("DELETE FROM posts WHERE post_id = $1", [id]);
      res.redirect("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).send("An error occurred while deleting the post.");
    }
  } else {
    try {
      const result = await db.query("SELECT * FROM posts WHERE post_id = $1", [id]);
      const data = result.rows[0];
      const imagesResult = await db.query("SELECT * FROM post_images WHERE post_id = $1", [id]);
      const images = imagesResult.rows.map(row => row.image.toString('base64'));
      const commentsResult = await db.query(
        `SELECT c.comment_id, c.comment_text, a.name AS account_name
         FROM comments c
         JOIN account a ON c.account_id = a.id
         WHERE c.post_id = $1`,
        [id]
      );
      const comments = commentsResult.rows;

      for (let comment of comments) {
        const repliesResult = await db.query(
          `SELECT r.reply_text, a.name AS account_name
           FROM replies r
           JOIN account a ON r.account_id = a.id
           WHERE r.comment_id = $1`,
          [comment.comment_id]
        );
        comment.replies = repliesResult.rows;
      }

      const combinedData = {
        ...data,
        images: images
      };

      res.render('post.ejs', { data: combinedData, type: type, comments: comments, account_id: req.session.account_id });
    } catch (error) {
      console.error("Error fetching details:", error);
      res.status(500).send("An error occurred while fetching details.");
    }
  }
});

app.get("/account/:type/:id", async (req, res) => {
  const type = req.params.type
  const id = req.params.id
  console.log(typeof (id))
  console.log(id)

  if (type === "delete") {
    await db.query(`delete from replies where account_id = $1`, [id])
    await db.query(`delete from comments where account_id = `, [id])
    await db.query(`DELETE FROM post_images WHERE post_id IN (SELECT post_id FROM posts WHERE account_id = $1);`, [id])
    await db.query(`DELETE FROM posts WHERE account_id = $1;`, [id])
    await db.query(`DELETE FROM account WHERE id = $1;`, [id])
    // res.redirect("/")
  } else {
    const accounts = (await get_one_account(id))
    const posts = await get_account_posts(id)
    console.log(req.session.account_id)
    res.render("uers-profile.ejs", { accounts: accounts, posts: posts, id: req.session.account_id })
  }
})




app.post("/comment", async (req, res) => {
  const { comment_text, post_id, account_id } = req.body;
  try {
    await db.query(
      "INSERT INTO comments (post_id, account_id, comment_text) VALUES ($1, $2, $3)",
      [post_id, account_id, comment_text]
    );
    res.redirect(`/post/view/${post_id}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).send("An error occurred while posting the comment.");
  }
});


app.post("/reply", async (req, res) => {
  const { reply_text, comment_id, account_id } = req.body;
  try {
    await db.query(
      "INSERT INTO replies (comment_id, account_id, reply_text) VALUES ($1, $2, $3)",
      [comment_id, account_id, reply_text]
    );
    res.redirect("back");
  } catch (error) {
    console.error("Error posting reply:", error);
    res.status(500).send("An error occurred while posting the reply.");
  }
});



app.get("/my_chat/:id", async (req, res) => {

  try {
    const sender_id = req.params.id;
    const messages = await db.query('SELECT * FROM messages WHERE (sender_id = $1) OR (receiver_id = $1 )ORDER BY timestamp ASC', [sender_id]);
    const accountsSet = new Set();
    for (const row of messages.rows) {
      if (!accountsSet.has(row.receiver_id)) {
        const account = await get_one_account(row.sender_id);
        accountsSet.add(account);
      }
    }
    const accounts = {};
    accountsSet.forEach(account => {
      if (!accounts[account.id]) {
        accounts[account.id] = {
          id: account.id,
          name: account.name,
          logo_image: []
        };
      }
      if (account.logo_image) {
        accounts[account.id].logo_image.push(account.logo_image.toString('base64'));
      }
    });

    const accountsArray = Object.values(accounts);
    const randomAccounts = [];
    const totalAccounts = accountsArray.length;

    for (let i = 0; i < totalAccounts; i++) {
      const randomIndex = Math.floor(Math.random() * accountsArray.length);
      randomAccounts.push(accountsArray.splice(randomIndex, 1)[0]);
    }


    await messages.rows.forEach(message => {
      const date = new Date(message.timestamp);
      message.timestamp = date.toLocaleString('en-US', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    });
    console.log(messages.rows)
    res.render("chats.ejs", { messages: messages.rows, accounts: randomAccounts, id: req.session.account_id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});




app.post('/chat', async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  const messages = await db.query(
    'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) OR (receiver_id = $2) ORDER BY timestamp ASC',
    [sender_id, receiver_id]
  );
  const account = await get_one_account(receiver_id);
  const accounts = {
    id: account.id,
    name: account.name,
    logo_image: account.logo_image.toString('base64')
  };
  res.render('send_chat.ejs', { messages: messages.rows, sender_id, receiver_id, accounts: accounts });

});




app.post('/send-message', async (req, res) => {
  const { sender_id, receiver_id, message_text } = req.body;
  await db.query(
    'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3)',
    [sender_id, receiver_id, message_text]
  );
  const messages = await db.query(
    'SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY timestamp ASC',
    [sender_id, receiver_id]
  );
  const account = await get_one_account(receiver_id);
  const accounts = {
    id: account.id,
    name: account.name,
    logo_image: account.logo_image.toString('base64')
  };
  console.log(messages)
  res.render('send_chat.ejs', { messages: messages.rows, sender_id, receiver_id, accounts: accounts });
})

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', async (message) => {
    const { sender_id, receiver_id, message_text } = message;
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, message_text]
    );
    io.emit('receiveMessage', result.rows[0]);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



app.listen(3000, () => {
  console.log("starting")
})



