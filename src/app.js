const express = require("express")
const session = require("express-session")
const passport = require("passport")
const morgan = require("morgan")
const cors = require("cors")
const app = express()

const { connectDB } = require("../config/database")

require("dotenv").config()
require("../config/passport")


// set the view engine to ejs
app.set("view engine", "ejs")

// set the public folder
app.use(express.static("public"))


const PORT = process.env.PORT || 3000
app.use(session({secret:"theDevs"}))
app.use(cors(
  {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: false,
    }
))

// Middleware for JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
)

// Passport initialization --> for google auth
app.use(passport.initialize())
app.use(passport.session())


// Home auth
app.get("/", (req, res) => {
  try {
    res.render("index")
  } catch (err) {
    res.status(500).json({ status: "error" })
  }
})





// Routes
const paymentRoutes = require("../routes/payment")
const uploadRoute = require("../routes/upload")
const queryRoute = require("../routes/query")
const userRoutes = require("../routes/userRoute")
const chatRoutes = require("../routes/chatRoute")




// Mount routes
app.use("/payment", paymentRoutes)
app.use("/upload", uploadRoute)
app.use("/query", queryRoute)
app.use("/user", userRoutes)
app.use("/chat", chatRoutes)







// start the DB connection before starting the app
connectDB()
  .then(() => {
    console.log("Database connected")
    // Start the server after the database connection is established
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Database connection error:", err)
  })
