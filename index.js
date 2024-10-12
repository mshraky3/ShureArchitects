import express from "express"; import bodyParser from "body-parser"; import pg from "pg"
import session from "express-session"; import fileUpload from "express-fileupload"
import multer from 'multer'; 
const app = express();app.use(fileUpload()); app.use(bodyParser.urlencoded({ extended: !0 })); app.use('/public', express.static('public')); app.use(session({ secret: "18/10/2019", resave: !1, saveUninitialized: !0, cookie: { maxAge: 1000 * 60 * 10 } }))
const storage = multer.memoryStorage(); const upload = multer({ storage: storage }); const date = new Date()
const year = date.getFullYear()
const db=new pg.Client({user:"users_x5qf_user",host:"dpg-crd1mqg8fa8c73bg324g-a",port:5432,password:"gdFRLYxirPld1F0MrJ1rsK6LVlDDvFjj",database:"users_x5qf"})
// const db = new pg.Client({
//   password: "Ejc9c123",
//   host: "localhost",
//   database: "DASH",
//   user: "postgres",
//   port: 5432
// })
db.connect()
async function get_users_data() { const result = await db.query("SELECT * FROM account"); return result }
async function get_one_account(id) {
  const result = await db.query("SELECT * FROM account where id = $1", [id]); let accounts = {}; result.rows.forEach(row => {
    if (!accounts[row.id]) { accounts[row.id] = { id: row.id, name: row.name, rating: Math.round((row.rating) / row.rating_length), username: row.username, location: row.location, type: row.account_type, logo_image: [], number: row.phone_number, description: row.description, email: row.email, account_type: row.account_type } }
    if (row.logo_image) { accounts[row.id].logo_image.push(row.logo_image.toString('base64')) }
  }); const accountsArray = Object.values(accounts); const randomaccounts = []; const totalaccounts = accountsArray.length; for (let i = 0; i < totalaccounts; i++) { const randomIndex = Math.floor(Math.random() * accountsArray.length); randomaccounts.push(accountsArray.splice(randomIndex, 1)[0]) }
  return randomaccounts[0]
}
async function get_all_data() {
  let data = { companies: '', freelancers: '', contractors: '' }; try {
    const queries = [db.query(`
                SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
                FROM account ci
                INNER JOIN posts ci2 ON ci.id = ci2.account_id
                INNER JOIN post_images pi ON ci2.post_id = pi.post_id
                WHERE ci2.post_type = 'company';
            `), db.query(`
                SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
                FROM account ci
                INNER JOIN posts ci2 ON ci.id = ci2.account_id
                INNER JOIN post_images pi ON ci2.post_id = pi.post_id
                WHERE ci2.post_type = 'contractor';
            `), db.query(`
                SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
                FROM account ci
                INNER JOIN posts ci2 ON ci.id = ci2.account_id
                INNER JOIN post_images pi ON ci2.post_id = pi.post_id
                WHERE ci2.post_type = 'freelancer';
            `)]; const [companyResult, contractorResult, freelancerResult] = await Promise.all(queries); const processResults = (rows) => {
      const result = {}; rows.forEach(row => {
        if (!result[row.post_id]) { result[row.post_id] = { id: row.post_id, name: row.name, location: row.location, number: row.phone_number, title: row.post_title, images: [] } }
        if (row.image) { result[row.post_id].images.push(row.image.toString('base64')) }
      }); return Object.values(result)
    }; const getRandomizedArray = (array) => { return array.sort(() => Math.random() - 0.5) }; data.companies = getRandomizedArray(processResults(companyResult.rows)); data.contractors = getRandomizedArray(processResults(contractorResult.rows)); data.freelancers = getRandomizedArray(processResults(freelancerResult.rows)); return data
  } catch (err) { return data }
}
async function get_account_posts(account_id) {
  const companyResult = await db.query(`
    SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
    FROM account ci
    INNER JOIN posts ci2 ON ci.id = ci2.account_id
    INNER JOIN post_images pi ON ci2.post_id = pi.post_id
    WHERE ci.id = ${account_id}
    `); const companies = {}; companyResult.rows.forEach(row => {
    if (!companies[row.post_id]) { companies[row.post_id] = { id: row.post_id, name: row.name, location: row.location, number: row.phone_number, title: row.post_title, images: [] } }
    if (row.image) { companies[row.post_id].images.push(row.image.toString('base64')) }
  }); const companiesArray = Object.values(companies); const randomCompanies = []; const totalCompanies = companiesArray.length; for (let i = 0; i < totalCompanies; i++) { const randomIndex = Math.floor(Math.random() * companiesArray.length); randomCompanies.push(companiesArray.splice(randomIndex, 1)[0]) }
  return randomCompanies
}
app.get("/", async (req, res) => {
  try {
    const queries = [db.query(`
                SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
                FROM account ci
                INNER JOIN posts ci2 ON ci.id = ci2.account_id
                INNER JOIN post_images pi ON ci2.post_id = pi.post_id
                WHERE ci2.post_type = 'company' AND ci.account_type = 'user';
            `), db.query(`
                SELECT ci.id, ci.name, ci.location, ci.phone_number, ci.rating, ci2.description, ci2.post_title, ci2.post_id, pi.image
                FROM account ci
                INNER JOIN posts ci2 ON ci.id = ci2.account_id
                INNER JOIN post_images pi ON ci2.post_id = pi.post_id
                WHERE ci2.post_type = 'contractor' AND ci.account_type = 'user';
            `)]; const [companyResult, contractorResult] = await Promise.all(queries); const processResults = (rows) => {
      return rows.reduce((acc, row) => {
        if (!acc[row.post_id]) { acc[row.post_id] = { id: row.post_id, name: row.name, title: row.post_title, images: [] } }
        if (row.image) { acc[row.post_id].images.push(row.image.toString('base64')) }
        return acc
      }, {})
    }; const getRandomizedArray = (array, count) => { return array.sort(() => 0.5 - Math.random()).slice(0, count) }; const companies = processResults(companyResult.rows); const contractors = processResults(contractorResult.rows); const randomCompanies = getRandomizedArray(Object.values(companies), 4); const randomContractors = getRandomizedArray(Object.values(contractors), 4); res.render("profile.ejs", { date: year, id: req.session.account_id, username: req.session.username, companies: randomCompanies, contractors: randomContractors, type: req.session.type, is_user: req.session.is_user, num: 4 - randomContractors.length, Cnum: 4 - randomCompanies.length })
  } catch (error) { res.redirect("/login") }
}); app.post("/profile", async (req, res) => {
  const { username, password } = req.body;
  if (username === "admin@admin.com" && password === "0501901012") { req.session.is_admin = !0; return res.redirect("/admin") }
  try {
    const result = await db.query(`
      SELECT id, password, account_type 
      FROM account 
      WHERE username = $1
    `, [username]); if (result.rows.length > 0 && result.rows[0].password === password) { req.session.is_user = !0; req.session.account_id = result.rows[0].id; req.session.type = result.rows[0].account_type; req.session.username = username; return res.redirect("/") } else { return res.redirect("/login") }
  } catch (err) { return res.redirect("/login") }
}); app.get("/login", (req, res) => { res.render("login.ejs") })
app.get("/register", (req, res) => { res.render("register.ejs") })
app.post("/register", async (req, res) => {
  const { username, password, name, location, phone_number, email, website_url, rating, description, account_type } = req.body; if (!req.files) { return res.render("register.ejs", { mseeg: "please select image" }) }
  if (req.files.logo_image.size > 50 * 1024 * 1024) { return res.render("register.ejs", { mseeg: "image size must be under 50 mb" }) }
  const logo_image = req.files.logo_image.data; try {
    const checkResult = await db.query("SELECT 1 FROM account WHERE username = $1", [username]); if (checkResult.rows.length > 0) { return res.render("register.ejs", { mseeg: "Username is already used, try to login or use another username" }) }
    if (password.length < 8) { return res.render("register.ejs", { mseeg: "The password must be more than 8 characters long" }) }
    const insertQuery = `
      INSERT INTO account (username, password, name, logo_image,  location, phone_number, email, website_url, rating, description, account_type )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `; const values = [username, password, name, logo_image, location, phone_number, email, website_url, 0, description, account_type]; await db.query(insertQuery, values); res.redirect("/login")
  } catch (err) { res.redirect("/register") }
}); app.get("/list/:type", async (req, res) => {
  try {
    const type = req.params.type; const result = await db.query(`
      SELECT id, name, phone_number, rating, rating_length, username, location, logo_image, email, account_type
      FROM account
      WHERE account_type = $1
    `, [type]); const accounts = result.rows.reduce((acc, row) => {
      if (!acc[row.id]) { acc[row.id] = { id: row.id, name: row.name, phone_number: row.phone_number, rating: Math.round(row.rating / row.rating_length), username: row.username, location: row.location, logo_image: [], email: row.email, account_type: row.account_type } }
      if (row.logo_image) { acc[row.id].logo_image.push(row.logo_image.toString('base64')) }
      return acc
    }, {}); const itemsArray = Object.values(accounts); res.render("list.ejs", { type: type, is_user: req.session.is_user, companies: itemsArray })
  } catch (error) { res.redirect("login") }
}); app.get("/admin", async (req, res) => {
     
  if (!req.session.is_admin) { return res.redirect("/login") }
  try {
    const [posts_data, data] = await Promise.all([get_all_data(), get_users_data()]); const accounts = data.rows.reduce((acc, row) => {
      if (!acc[row.id]) { acc[row.id] = { id: row.id, name: row.name, username: row.username, location: row.location, logo_image: [], email: row.email, account_type: row.account_type } }
      if (row.logo_image) { acc[row.id].logo_image.push(row.logo_image.toString('base64')) }
      return acc
    }, {}); const accountsArray = Object.values(accounts); for (let i = accountsArray.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[accountsArray[i], accountsArray[j]] = [accountsArray[j], accountsArray[i]] }
    const resalt = await db.query("select id from account where account.account_type ='user'")
    const resalt1 = await db.query("select post_id from  posts where post_type ='viwe'")
    const resalt2 = await db.query("select id from account where account.account_type ='company'")
    const resalt3 = await db.query("select id from account where account.account_type ='contractor'")
    const resalt4 = await db.query("select id from account where account.account_type ='freelancer'")
    const resalt5 = await db.query("select id from account")
    const resalt6 = await db.query("select post_id from posts")
    res.render("admin.ejs", { companies: posts_data.companies, type: "company", contractors: posts_data.contractors, typeC: "contractor", freelancers: posts_data.freelancers, typeF: "freelancer", is_user: !0, accounts: accountsArray, usersStats: resalt.rows.length, postsStats: resalt1.rows.length, companyStats: resalt2.rows.length, contractorStats: resalt3.rows.length, freelancerStats: resalt4.rows.length, allStats: resalt5.rows.length, allPosts: resalt6.rows.length })
  } catch (err) { res.redirect("/login") }
}); app.post("/upload_post", async (req, res) => {
  if (!req.body.username) {
    const result = await db.query(`select * from account where username = $1`, [req.session.username])
    const account = result.rows[0]
    res.render("upload_post.ejs", { user: req.session.username, list_type: req.body.upload_type, account: account })
  } else { res.redirect("/") }
})
app.post("/upload_new_post", async (req, res) => {
  const images = req.files.image; if (!images) { return res.redirect("/") }
  const imageArray = Array.isArray(images) ? images : [images]; for (const img of imageArray) { if (img.size > 50 * 1024 * 1024) { return res.send("Images have to be smaller than 50MB") } }
  const { companyName, location, number, details, title, accountID, list_type } = req.body; try {
    await db.query('BEGIN'); const result = await db.query("INSERT INTO posts (account_name, location, description, account_id, post_title, post_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING post_id", [companyName, location, details, accountID, title, list_type]); const postId = result.rows[0].post_id; const imageValues = imageArray.map(image => [image.data, postId]); const insertImagesQuery = `
      INSERT INTO post_images (image, post_id) VALUES ${imageValues.map((_, i) => `($${i * 2 + 1},$${i * 2 + 2})`).join(', ')}
    `; const insertImagesParams = imageValues.flat(); await db.query(insertImagesQuery, insertImagesParams); await db.query('COMMIT'); res.redirect("/")
  } catch (err) { await db.query('ROLLBACK'); res.redirect("/login") }
}); app.post("/uploaded", async (req, res) => {
  try {
    const { upload_type } = req.body; const validTypes = ['company', 'contractor', 'freelancer']; if (!validTypes.includes(upload_type)) { return res.status(400).send("Invalid upload type.") }
    const query = `
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
      LEFT JOIN 
        post_images pi ON ci2.post_id = pi.post_id
      WHERE 
        ci2.post_type = $1 and ci.account_type = 'user';
    `; const result = await db.query(query, [upload_type]); const items = result.rows.reduce((acc, row) => {
      if (!acc[row.post_id]) { acc[row.post_id] = { id: row.post_id, name: row.name, location: row.location, number: row.phone_number, details: row.description, title: row.post_title, images: [] } }
      if (row.image) { acc[row.post_id].images.push(row.image.toString('base64')) }
      return acc
    }, {}); const itemsArray = Object.values(items); res.render("list.ejs", { companies: itemsArray, type: upload_type, posts: !0 })
  } catch (err) { res.redirect("/login") }
}); app.get("/post/:type/:id", async (req, res) => {
  const id = req.params.id; const type = req.params.type; if (type === "delete") {
    try {
      await db.query(`DELETE FROM replies USING comments WHERE replies.comment_id = comments.comment_id AND comments.post_id = $1;`, [id])
      await db.query(`delete from comments where post_id = $1`, [id])
      await db.query("DELETE FROM post_images WHERE post_id = $1", [id]); await db.query("DELETE FROM posts WHERE post_id = $1", [id]); res.redirect("/")
    } catch (error) { res.redirect("/login") }
  } else {
    try {
      const result = await db.query("SELECT * FROM posts WHERE post_id = $1", [id]); const data = result.rows[0]; const imagesResult = await db.query("SELECT * FROM post_images WHERE post_id = $1", [id]); const images = imagesResult.rows.map(row => row.image.toString('base64')); const commentsResult = await db.query(`SELECT c.comment_id, c.comment_text, a.name AS account_name
         FROM comments c
         JOIN account a ON c.account_id = a.id
         WHERE c.post_id = $1`, [id]); const comments = commentsResult.rows; for (let comment of comments) {
        const repliesResult = await db.query(`SELECT r.reply_text, a.name AS account_name
           FROM replies r
           JOIN account a ON r.account_id = a.id
           WHERE r.comment_id = $1`, [comment.comment_id]); comment.replies = repliesResult.rows
      }
      const combinedData = { ...data, images: images }; res.render('post.ejs', { data: combinedData, type: type, comments: comments, account_id: req.session.account_id })
    } catch (error) { res.redirect("/login") }
  }
}); app.get("/account/:type/:id", async (req, res) => {
  const type = req.params.type; const id = req.params.id; if (type === "delete") {
    try {
      await db.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1;', [id])
      await db.query(`DELETE FROM replies WHERE account_id = $1`, [id]); await db.query(`DELETE FROM comments WHERE account_id = $1`, [id]); await db.query(`DELETE FROM post_images WHERE post_id IN (SELECT post_id FROM posts WHERE account_id = $1)`, [id]); await db.query(`DELETE FROM posts WHERE account_id = $1`, [id]); await db.query(`DELETE FROM account WHERE id = $1`, [id]); res.redirect("/")
    } catch (error) { res.redirect("/login") }
  } else {
    let able_to_rate = !0; if (type === "viewafterrating") { able_to_rate = !1 }
    try {
      const [accounts, posts, messagesResult] = await Promise.all([get_one_account(id), get_account_posts(id), db.query('SELECT * FROM messages WHERE (sender_id = $1) OR (receiver_id = $1) ORDER BY timestamp ASC', [req.session.account_id])]); const check = (messages) => {
        if (messages.rows && messages.rows.length > 0) { const lastMessage = messages.rows[messages.rows.length - 1]; return lastMessage && lastMessage.read_status !== undefined ? lastMessage.read_status : !1 }
        return !1
      }; res.render("uers-profile.ejs", { accounts: accounts, posts: posts, id: req.session.account_id, newM: check(messagesResult), able_to_rate: able_to_rate })
    } catch (error) { res.redirect("/login") }
  }
}); app.post("/rating/:id", async (req, res) => {
  const id = req.params.id
  const rating = req.body.rating
  if (req.session.account_id !== id) {
    try {
      const curRating = await db.query("select rating from account where id = $1 ;", [id])
      const new_rating = await db.query("UPDATE account set rating = rating + $1  where id = $2", [rating, id])
      const new_rating_length = await db.query("UPDATE account set rating_length = rating_length + 1  where id = $1", [id])
      res.redirect(`/account/viewafterrating/${id}`)
    } catch (err) { res.redirect(`/account/viewafterrating/${id}`) }
  }
})
app.post("/comment", async (req, res) => { const { comment_text, post_id, account_id } = req.body; try { await db.query("INSERT INTO comments (post_id, account_id, comment_text) VALUES ($1, $2, $3)", [post_id, account_id, comment_text]); res.redirect(`/post/view/${post_id}`) } catch (error) { res.redirect("/login") } }); app.post("/reply", async (req, res) => { const { reply_text, comment_id, account_id } = req.body; try { await db.query("INSERT INTO replies (comment_id, account_id, reply_text) VALUES ($1, $2, $3)", [comment_id, account_id, reply_text]); res.redirect("back") } catch (error) { res.redirect("/login") } });
app.listen(3000, () => {})