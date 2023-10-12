require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/images", express.static("./uploads"));

app.listen(process.env.PORT || 8000, () => {
  mongoose
    .connect(process.env.DB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => {
      console.log(`App is running on port ${process.env.PORT}`);
    })
    .catch((err) => {
      console.log("Error while connecting to Mongoose: ", err.message);
    });
});

// Routes
app.use("/auth", require("./routes/AuthRoutes"));
app.use("/user", require("./routes/UserRoutes"));
app.use("/tasks", require("./routes/TaskRoutes"));

// Not found url
app.get("*", (req, res) => {
  res.status(404).json({ message: "Requested endpoint is not available" });
});
