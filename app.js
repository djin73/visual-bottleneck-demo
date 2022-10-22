const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const app = express();
const port = 88;

dotenv.config();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const router = require("./routes.js");
app.use(router);

app.listen(port);
console.log(
  `Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`
);
