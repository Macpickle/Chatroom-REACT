const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const appError = require('../utils/appError.js');
const {USER_ALREADY_EXISTS,
      INVALID_LOGIN_CREDENTIALS,
      FIELD_MISSING
      } = require('../constants/constants');

const { tryCatch } = require('../utils/tryCatch');

//reset password
const { forgetPassword, resetPassword } = require('../controllers/auth');

//models
const User = require('../models/Users');

//forget password
router.post('/api/forget-password', forgetPassword);

//reset password
router.post('/api/reset-password', resetPassword);

//check if there is a current session of user/ if user is logged in
router.get('/api/is-authenticated', tryCatch(async (req, res) => {
    console.log(req.session);
    
    return false;
}));

//register new user
router.post('/api/register', tryCatch(async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
        throw new appError(FIELD_MISSING, 'Please fill in all fields', 401);
    }

    if (password !== confirmPassword) {
        throw new appError(INVALID_LOGIN_CREDENTIALS, 'Passwords do not match', 401);
    }
    //check if user already exists
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
        throw new appError(USER_ALREADY_EXISTS, 'User already exists', 401);
    }

    //check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new appError(INVALID_LOGIN_CREDENTIALS, 'Invalid email format', 401);
    }

    //create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username: username,
        email: email,
        password: hashedPassword,
    });
    await newUser.save();

    return res.status(201).json({
        status: 'ok',
        message: 'User registered successfully',
        username: newUser.username,
    });
}));

//login user
router.post('/api/login', passport.authenticate('local', {
    failureRedirect: '/api/login',
    failureFlash: true,
}), (req,res) => {
    console.log('login good');
}
    
);

module.exports = router;