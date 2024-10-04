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

app.listen(PORT, (req, res) => {
  console.log(`running server...`);
});