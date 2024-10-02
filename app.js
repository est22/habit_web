const express = require("express");
const fs = require("fs");
const moment = require("moment");
const sqlite3 = require("sqlite3");
const path = require("path");

// DB setting
const db_name = path.join(__dirname, "habit.db");
const db = new sqlite3.Database(db_name);


const app = express();
const PORT = 3000;


app.set("views", "./views");
app.set("view engine", "ejs");



// const create_users_sql = `
// create table if not exists users (
//     id integer primary key AUTOINCREMENT,
//     name varchar(100),
//     email varchar(255) UNIQUE,
//     password varchar(255),
//     createdAt datetime default CURRENT_TIMESTAMP
// )`;


// const create_habits_sql = `
//   create table if not exists habits (
//     id integer primary key AUTOINCREMENT,
//     habit_name varchar(255),
//     start_date datetime,
//     end_date datetime
//     createdAt datetime default CURRENT_TIMESTAMP,
//     user_id integer not null,
//     FOREIGN KEY(user_id) REFERENCES user(id)
//   )
// `;

// const create_records_sql = `
//   create table if not exists records (
//     id integer PRIMARY key AUTOINCREMENT,
//     memo varchar(255),
//     createdAt datetime default CURRENT_TIMESTAMP,
//     habit_id integer not null,
//     FOREIGN KEY(habit_id) REFERENCES habits(id)
//   )
// `;



// db.serialize(() => {
//   db.run(create_users_sql);
//   db.run(create_habits_sql);
//   db.run(create_records_sql);
// });

// view
app.get("/view/:id", (req, res) => {
  const id = req.params.id;
  let sql = `select id, title, content, author, createdAt, count from posts where id = ${id}`;

  let countSql = `update posts set count = count + 1 where id = ${id}`;
  db.run(countSql);

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      const post = rows[0];
      res.render("view", { post: post });
    }
  });
});

// create
app.get("/create", (req, res) => {
  res.render("create");
});

app.use(express.urlencoded({ extended: true })); //  data from <form> -> post

app.post("/create", (req, res) => {
  const createdAt = moment().format("YYYY-MM-DD");
  let sql = `insert into posts(title, content, author, createdAt)
  values('${req.body.title}','${req.body.content}','${req.body.author}', '${createdAt}')`;

  db.run(sql, (err) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/list");
    }
  });
});

// edit
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  let sql = `select id, title, content, author, createdAt, count from posts where id = ${id}`;

  let countSql = `update posts set count = count + 1 where id = ${id}`;
  db.run(countSql);

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      const post = rows[0];
      res.render("edit", { post: post });
    }
  });
});

app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  let sql = `update posts set
    title = '${req.body.title}',
    content = '${req.body.content}',
    author = '${req.body.author}'
    where id = ${id}`;

  db.run(sql, (err) => {
    if (err) {
      // console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect(`/view/${id}`);
    }
  });
});

//   const result = fs.readFileSync("test.json", "utf-8");
//   let data = JSON.parse(result);

//   for (item of data["result"]) {
//     if (item["id"] == id) {
//       item["title"] = req.body.title;
//       item["content"] = req.body.content;
//       item["author"] = req.body.author;
//       item["count"] = item["count"] ? item["count"] : 0;
//     }
//   }
//   fs.writeFileSync("test.json", JSON.stringify(data), "utf-8");
//   res.redirect(`/view/${id}`);
// });

app.get("/remove/:id", (req, res) => {
  const id = req.params.id;

  let sql = `delete from posts where id = ${id}`;
  db.run(sql, (err) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/list");
    }
  });
});

app.listen(PORT, (req, res) => {
  console.log(`running server...`);
});
