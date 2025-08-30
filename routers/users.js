const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler")
const { Users, validationRegister, validationLogin } = require("../models/Users")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyTokenAndUser = require("../middlewares/verifyToken");




/*
 * @route   POST /users/register
 * @desc    Create a new user account
 * @access  Public
*/

router.post("/register", asyncHandler(async (req, res) => {

  const { error } = validationRegister(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }


  const { fullname, username, email, password } = req.body;
  const data = { username, email }
  const existingUser = await Users.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    if (existingUser.username === username) {
      return res.status(400).json({ message: "Username is already taken" });
    }
    if (existingUser.email === email) {
      return res.status(400).json({ message: "Email is already registered" });
    }
  }
  //  Hash password
  data.password = await bcrypt.hash(password, 10);


  //  Create and save the user
  const user = new Users(data);

  const result = await user.save();
  if (!result) {
    return res.status(500).json({ message: "Failed to create account." });
  }
  console.log(req.isAdmin)
  //  Remove password before sending the response
  const { password: _, ...userWithoutPassword } = result.toObject();
  const token = user.generateToken()

  const decoded = jwt.verify(token, process.env.SECRET);
  req.isAdmin = decoded.isAdmin
  return res.status(201).json({
    message: "Account created successfully.",
    token,
    user: userWithoutPassword,
    isAdmin: req.isAdmin
  });
}));

/*
 * @route   POST /users/login
 * @desc    Login a user
 * @access  Public
*/

router.post("/login", asyncHandler(async (req, res) => {
  const { error } = validationLogin(req.body)
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const { email, password } = req.body
  const user = await Users.findOne({ email })
  if (!user) {
    return res.status(404).json({ message: "User not found (404)." })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" })
  }

  const token = user.generateToken();

  const decoded = jwt.verify(token, process.env.SECRET);
  req.isAdmin = decoded.isAdmin
  const { password: _, ...userWithoutPassword } = user.toObject()
  res.status(200).json({
    message: "Login Successfully!",
    token,
    user: userWithoutPassword,
    isAdmin: req.isAdmin
  })
}))

router.get("/all", verifyTokenAndUser ,asyncHandler(async (req, res) => {
  const users = await Users.find().select("-password").sort({ createdAt: -1 });
  res.status(200).json(users);
}))



module.exports = router;