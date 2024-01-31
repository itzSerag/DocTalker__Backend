const express = require("express")
const router = express.Router()
const {
  createUser,
  deleteUser,
  updateUser,
} = require("../controllers/userController")
const { auth } = require("../middlewares/auth")
const { signup, login, resendOtp } = require("../controllers/authController")
const { verifyOtp } = require("../controllers/authController")
const passport = require("passport")
function isLoggedIn(req, res, next) {
  require.user ? next() : res.sendStatus(401)
}

router.post("/login", login)
router.post("/signup", signup)
// Routes that require authentication
router.delete("/", auth, deleteUser)
router.put("/", auth, updateUser)
router.get("/verifyToken", auth, (req, res) => {
  res.status(200).json({ message: "Token is valid" })
})
// TODO GOOGLE AUTH
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
)
router.get(
  "/auth/google/redirect",
  passport.authenticate("google", {
    successRedirect: "/auth/protected",
    failureRedirect: "/auth/failure",
  })
)
router.get("/auth/protected", isLoggedIn, (req, res) => {
  res.send("success google authenticate")
})

router.get("/auth/failure", (req, res) => {
  res.send("something wrong try again")
})
//TODO OTP AUTH
router.post("/otp/verify", auth, verifyOtp)
router.post("/otp/resend", auth, resendOtp)

module.exports = router
