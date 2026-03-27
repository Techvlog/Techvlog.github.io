const express = require("express");
const cors = require("cors");
const authroutes = require("./routes/authroutes");
const imgrouter = require("./service/imgupload");
require("dotenv").config();

const functionroutes = require("./routes/functionroutes");
const publicationroutes = require("./routes/publicationroutes");
const cookieparser = require("cookie-parser");
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authroutes);
app.use("/api", functionroutes);
app.use("/pub", publicationroutes);
app.use("/image", imgrouter);
app.get("/health", (req, res) => {
  res.send("server is up");
});
app.use((err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message,
    message: err.message,
    status: statusCode,
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
