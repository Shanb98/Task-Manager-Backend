const express = require("express");
const dotenv = require("dotenv");
const connectiondb = require("./config/dbConnection");

dotenv.config();
connectiondb();
const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/admins", require("./routes/adminRoutes"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});