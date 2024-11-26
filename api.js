const express = require("express");
const fs = require("fs");
const moment = require("moment");
const sqlite3 = require("sqlite3");
const path = require("path");

// DB setting
const db_name = path.join(__dirname, "habit.db");
const db = new sqlite3.Database(db_name);

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/users", (req, res) => {
  const users_sql = `select * from users`;
  db.all(users_sql, [], (err, rows) => {
    res.json({ users: rows });
  });
});

// Habit list route
app.get("/users/:user_id/habit", (req, res) => {
  const user_id = req.params.user_id;

  const list_sql = `
  SELECT id, habit_name, start_date, end_date,
  (SELECT count (1) FROM records r WHERE r.habit_id = h.id) count
  FROM habits h
  WHERE user_id = ${user_id}`;

  db.all(list_sql, [], (err, rows) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    }
    if (rows) {
      res.json({ habits: rows });
    }
  });
});

// add habit
app.post("/users/:user_id/habit/add", (req, res) => {
  const { habit_name, start_date, end_date } = req.body;

  const user_id = req.params.user_id;
  const insert_new_habit_sql = `
  INSERT into habits(habit_name, start_date, end_date, user_id)  values('${habit_name}', '${start_date}', '${end_date}', ${user_id})`;

  db.run(insert_new_habit_sql, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
    res.redirect(`/users/${user_id}/habit`);
  });
});

// delete Habit
app.delete("/users/:user_id/habit/:id", (req, res) => {
  const habit_id = req.params.id;
  const user_id = req.params.user_id; // added

  let delete_record_sql = `DELETE FROM records WHERE id = ?`;
  db.run(delete_record_sql, [habit_id], (err) => {
    if (err) {
      res.status(500).send(`Internal Server Error [records]: ${err}`);
    }
    const delete_habit_sql = `DELETE FROM habits WHERE id = ?`;

    db.run(delete_habit_sql, [habit_id], (err) => {
      if (err) {
        res.status(500).send(`Internal Server Error [habits]: ${err}`);
      }
      res.redirect(`/users/${user_id}/habit`); // added
    });
  });
});

// add habit
app.get("/habit/:id", (req, res) => {
  const habit_id = req.params.id;
  const user_id = req.params.user_id; // added

  // get habbit information
  const habit_sql = `SELECT * FROM habits WHERE id = ?`;

  db.get(habit_sql, [habit_id, user_id], (err, habit) => {
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

// add habit record
app.post("/users/:user_id/habit/:id/record/add", (req, res) => {
  const habit_id = req.params.id;
  const user_id = req.params.user_id; // added
  const { memo } = req.body;

  const insert_record__sql = `INSERT INTO records(memo, habit_id) VALUES (?, ?)`;

  db.run(insert_record__sql, [memo, habit_id], (err) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    }
    res.redirect("/users/${user_id}/habit/${habit_id}/record");
  });
});

// delete habit record
app.delete("/users/:user_id/habit/:hid/record/:rid", (req, res) => {
  const habit_id = req.params.hid;
  const record_id = req.params.rid;
  const user_id = req.params.user_id; // added

  const delete_record_sql = `DELETE FROM records WHERE id = ?`;
  db.run(delete_habit_sql, [record_id], (err) => {
    if (err) {
      res.status(500).send(`Internal Server Error [habits]: ${err}`);
    }
    res.redirect(`/users/${user_id}/habit/${habit_id / record}`); // added
  });
});

app.listen(PORT, (req, res) => {
  console.log(`running server...`);
});
