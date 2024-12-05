const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//Recreating Signup route by router.route()
router
  .route("/signup")
  .get(userController.renderSignup)
  .post(wrapAsync(userController.signup))

  
//Recreating Login route by router.route()
router
  .route("/login")
  .get(userController.renderLogin)
  .post(saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }) , userController.login)


router.get("/logout", userController.logout)

module.exports = router;