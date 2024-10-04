const express = require("express");
const fs = require("fs");
const moment = require("moment");
const sqlite3 = require("sqlite3");
const path = require("path");
// login, register
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

// DB setting
const db_name = path.join(__dirname, "habit.db");
const db = new sqlite3.Database(db_name);

const app = express();
const PORT = 3000;

app.set("views", "./views");
app.set("view engine", "ejs");
// CSS
app.use(express.static("public"));

app.use(
  expressSession({
    secret: "sample",
    resave: true,
    saveUninitialized: true,
  })
);
// Create DB
const create_users_sql = `
create table if not exists users (
    id integer primary key AUTOINCREMENT,
    name varchar(100),
    email varchar(255) UNIQUE,
    password varchar(255),
    createdAt datetime default CURRENT_TIMESTAMP
)`;
const create_habits_sql = `
  create table if not exists habits (
    id integer primary key AUTOINCREMENT,
    habit_name varchar(255),
    start_date datetime,
    end_date datetime,
    createdAt datetime default CURRENT_TIMESTAMP,
    user_id integer not null,
    FOREIGN KEY(user_id) REFERENCES user(id)
  )
`;
const create_records_sql = `
  create table if not exists records (
    id integer PRIMARY key AUTOINCREMENT,
    memo varchar(255),
    createdAt datetime default CURRENT_TIMESTAMP,
    habit_id integer not null,
    FOREIGN KEY(habit_id) REFERENCES habits(id)
  )
`;

// Run DB
db.serialize(() => {
  db.run(create_users_sql);
  db.run(create_habits_sql);
  db.run(create_records_sql);
});

app.use(express.urlencoded({ extended: true }));

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const check_dup_email_sql = `SELECT count(1) as count FROM users WHERE email = '${email}'`;

  db.get(check_dup_email_sql, (err, row) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    }
    if (row.count > 0) {
      res.status(200).send("Email already used ..");
    } else {
      const insert_user_sql = `INSERT into users(name, email, password)  values('${name}', '${email}', '${password}');`;
      db.run(insert_user_sql);
      res.redirect("/login");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  // body like 'email=test@gmail.com&password=12345'
  const { email, password } = req.body;
  // checking DB if there's email as 'test@gmail.com' & password as '12345'
  const check_sql = `SELECT * FROM users WHERE email='${email}' AND password='${password}'`;

  db.get(check_sql, (err, row) => {
    if (err) {
      // console.error(err);
      return res.redirect("/login?error=internal_error");
    }
    // row = user's object
    // if there's no row -> no user -> redirect to login page
    if (row) {
      req.session.user = {
        id: row.id,
        email: row.email,
        name: row.name,
      };

      res.redirect("/habit");
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/logout", (req, res) => {
  if (req.session.user) {
    req.session.user = null;
  }
  res.redirect("/login");
});

// Habit list route
app.get("/habit", (req, res) => {
  const user = req.session.user;

  if (user == undefined) {
    res.redirect("/login");
    return;
  }

  const list_sql = `
  SELECT id, habit_name, start_date, end_date,
  (SELECT count (1) FROM records r WHERE r.habit_id = h.id) count
  FROM habits h
  WHERE user_id = ${user.id}`;

  db.all(list_sql, [], (err, rows) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    }
    if (rows) {
      res.render("habit_list", { habits: rows });
    }
  });
});

// Delete Habit
app.get("/habit/delete/:id", (req, res) => {
  const id = req.params.id;

  let sql = `DELETE FROM habits WHERE id = ${id}`;
  db.run(sql, (err) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/habit");
    }
  });
});

// Delete Habit Note (Record)
app.get("/habit/:habit_id/delete_note/:id", (req, res) => {
  const id = req.params.id; // record id 
  const habit_id = req.params.habit_id; // habit_id

  let sql = `DELETE FROM records WHERE id = ${id}`;
  db.run(sql, (err) => {
    if (err) {
      console.error(err); // debug
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/habit/" + habit_id);
    }
  });
});

// Add Habit
app.get("/habit/add", (req, res) => {
  res.render("habit_add");
});

app.post("/habit/add", (req, res) => {
  console.log("Received data:", req.body); // debug
  const { habit_name, start_date, end_date } = req.body;
  const user = req.session.user;

  if (user === undefined) {
    res.redirect("/habit");
    return;
  }

  const insert_new_habit_sql = `
  INSERT into habits(habit_name, start_date, end_date, user_id)  values('${habit_name}', '${start_date}', '${end_date}', ${user.id})`;

  db.run(insert_new_habit_sql, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
    res.redirect("/habit");
  });
});

// Show habit list with habit information
app.get("/habit/:id", (req, res) => {
  const id = req.params.id;

  // get habbit information
  const habit_sql = `SELECT * FROM habits WHERE id = ?`;

  db.get(habit_sql, [id], (err, habit) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }

    // Query to retrieve the records for the specified habit
    const record_list_sql = `
    SELECT id, memo, createdAt
    FROM records
    WHERE habit_id = ?`;

    db.all(record_list_sql, [id], (err, rows) => {
      if (err) {
        return res.status(500).send("Internal Server Error");
      }

      console.log(habit, id); // debug - habit info
      res.render("habit_record_list", { habit, records: rows, id });
    });
  });
});

// Add note for habit record
app.get("/habit/:id/add_note", (req, res) => {
  const id = req.params.id;
  res.render("habit_record_add", { id });
});

app.post("/habit/:id/add_note", (req, res) => {
  const memo = req.body.memo;
  const habit_id = req.params.id;
  const note_sql = `INSERT INTO records(memo, habit_id) VALUES (?, ?)`;

  db.run(note_sql, [memo, habit_id], (err) => {
    console.log("Received data:", req.body); // debug

    if (err) {
      console.error(err); // debug
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/habit/" + habit_id);
    }
  });
});

app.listen(PORT, (req, res) => {
  console.log(`running server...`);
});
