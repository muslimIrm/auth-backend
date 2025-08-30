const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet")
const cors = require("cors")
const connectionWithMongooseDB = require("./mongooseDB/ConnectionMongoose")
const users = require("./routers/users")
// Connecation with mongooseDB database
connectionWithMongooseDB(app)

// Middleware & Global Config
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(express.urlencoded({extended: true}))

// Routers
app.use("/api", users)