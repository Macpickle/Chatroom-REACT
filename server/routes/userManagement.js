const router = require('express').Router();
const appError = require('../utils/appError.js');
const passport = require('passport');
const bcrypt = require('bcrypt');

// error code names
const {
    USER_ALREADY_EXISTS,
    INVALID_LOGIN_CREDENTIALS,
    FIELD_MISSING,
    INVALID_CREDENTIALS,
    CHAT_NOT_FOUND,
    USER_NOT_FOUND,
    INTERNAL_SERVER_ERROR,
    SERVER_ERROR,
    } = require('../constants/constants');

const { tryCatch } = require('../utils/tryCatch');

// models
const User = require('../models/Users');

// register new user
router.post('/api/register', tryCatch(async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
        throw new appError(FIELD_MISSING, 'Please fill in all fields', 401);
    }

    // checks if the input of passwords are equal
    if (password !== confirmPassword) {
        throw new appError(INVALID_LOGIN_CREDENTIALS, 'Passwords do not match', 401);
    }
    // check if user already exists in database
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
        throw new appError(USER_ALREADY_EXISTS, 'User already exists', 401);
    }

    // check if email is valid in a format of XXXX@XXXXXX.XXXXXXX
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new appError(INVALID_LOGIN_CREDENTIALS, 'Invalid email format', 401);
    }

    // hashes the password user inputted before appending to user model
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user, appends to User collection
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

// checks if passport was initalized properly, and is registering a user in the current session
// this is for client end to ensure all data is initalized
router.get('/api/login', tryCatch(async (req, res) => {
    if (req.user) {
        const user = await User.findOne({ username: req.user.username }, { username: 1 });
        return res.json({user});
    } else {
        return res.status(401).json({
            status: 'error',
            message: 'User not logged in',
        });
    }
}));

// checks if passport was initalized properly, and is registering a user in the current session
router.get('/api/loginSuccess', tryCatch(async (req, res) => {
    if (req.user) {
        res.status(200).json({
            status: 'ok',
            message: 'Login successful',
            username: req.user.username,
        });
    } else {
        throw new appError(SERVER_ERROR, 'User was not set properly', 500);
    }
}));

// login a user via passport
router.post('/api/login', function(req, res, next) {
    // remember for later (fix)
    const {username, password, remember} = req.body;

    if (!username || !password) {
        throw new appError(FIELD_MISSING, "Please fill in all fields", 401);
    }

    // session authentication via passport
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }

        if (!user) {
            throw new appError(INVALID_LOGIN_CREDENTIALS, 'Invalid username or password!', 401);
        }

        // passport login
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            res.status(200).json({
                status: 'ok',
                message: 'Login successful',
                username: user.username,
            });
        });
    })(req, res, next);
});

// logout user via passport
router.get('/api/logout', (req, res) => {
    req.logout();
    req.session.destroy(function (err) {
        if (err) {
            console.log("error: " + err);
            res.status(500).json({message: "Error destroying session"});
        } else{
            res.clearCookie('sid');
            res.status(200).json({message: "Logged out successfully"});
    }});
});

// deletes a user from database
router.post('/api/delete', tryCatch(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new appError(FIELD_MISSING, "Fields must be filled!", 401);
    }

    const user = await User.findOne({username: username});
    if (!user) {
        throw new appError(USER_NOT_FOUND, "User not found!", 401);
    }

    // checks if actual password is equal to password field
    const samePassword = await bcrypt.compare(password, user.password)
    if (!samePassword) {
        throw new appError(INVALID_CREDENTIALS, "Incorrect Password", 401);
    }

    await User.deleteOne({username: username});
    res.json({message: "User deleted successfully", status: "ok"});
}));

// get all users, usernames and photos used for searching fields/elements
router.get('/api/users', tryCatch(async (req, res) => {
    const users = await User.find({}, {username: 1, photo: 1});
    res.json(users);
}));

// get current user information (username and photo)
router.get('/api/users/:id', tryCatch(async(req,res) => {
    const user = await User.findOne({username: req.params.id},{username: 1, photo: 1});
    res.json({user})
}));

// updates setting object of a user with specific fields
function updateSetting(settingType, settingValue, username) {
    const update = { $set: {} };
    update.$set[`settings.${settingType}`] = settingValue;

    if (!settingValue || settingValue == null) {
        throw new appError(INVALID_CREDENTIALS, "Setting cannot be empty!", 400);
    }   

    User.findOneAndUpdate({username: username}, update, { new: true })
        .then(doc => {
            return;
        })
        .catch(err => {
            // unexpected errors
            throw new appError(INTERNAL_SERVER_ERROR, "Error updating settings!", 500);
        });
}

// update settings
router.post('/api/settings', tryCatch(async (req, res) => {
    const {
        username,
        newPassword,
        oldPassword,
        email,
        theme,
        language,
    } = req.body.formData;

    if (!username && !newPassword && !oldPassword && !email && !theme && !language) {
        throw new appError(FIELD_MISSING, "Fields must be filled!", 401);
    }

    // finds the current user information
    const currentUser = req.body.username;
    const user = await User.findOne({ username: currentUser });

    // checks if username field is not an existing user
    if (username) {
        const userExists = await User.findOne({username: username}, {username: 1})
        if (userExists) {
            throw new appError(INVALID_CREDENTIALS, "Username is already taken!", 401);
        }

        user.username = username
    }

    // checks if new password is valid, and is not the same as previous
    if (newPassword) {
        if (!oldPassword) {
            throw new appError(INVALID_CREDENTIALS, "Old password is required!", 401);
        }

        // compares the two passwords to eachother
        const samePassword = await bcrypt.compare(oldPassword, user.password)

        if (!samePassword) {
            throw new appError(INVALID_CREDENTIALS, "Incorrect Password", 401);
        }

        // sets password via hash
        user.password = await bcrypt.hash(newPassword, 10);
    }

    // compares the two password fields to check for confirmation
    if (oldPassword && !newPassword) {
        throw new appError(INVALID_CREDENTIALS, "New password is required!", 401);
    }

    // changes email
    if (email) {
        // checks if theres an account with this email
        const userExists = await User.findOne({email: email}, {email: 1});

        if (userExists) {
            throw new appError(INVALID_CREDENTIALS, "Email is already in use!", 401);
        }

        //check if email is following proper requirements of XXXXX@XXXX.XXXXX
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new appError(INVALID_LOGIN_CREDENTIALS, 'Invalid email format', 401);
        }

        user.email = email
    }

    if (theme) {
        //this is a dropdown menu, forced to have a value associated with it, therefore, no use to check if values are inputted properly
        updateSetting("theme", theme, currentUser);
    }

    if (language) {
        //this is a dropdown menu, forced to have a value associated with it, therefore, no use to check if values are inputted properly
        updateSetting("language", language, currentUser);
    }
    
    user.save();
    res.json({message: 'Settings updated successfully', status: 'ok'});
}));

// gets the theme of current account
router.get("/api/theme/:id", tryCatch(async (req, res) => {
    const user = await User.findOne({username: req.params.id}, {settings: 1});
    const theme = user.settings.theme;
    res.json({theme});
}));

// gets the photo of current account
router.get("/api/profilepicture/:id",tryCatch(async (req, res) => {
    const userPhoto = await User.findOne({username: req.params.id}, {photo: 1});
    res.json(userPhoto);
}));

// gets the blocked array of current user
router.get("/api/blocked/:id", tryCatch(async (req, res) => {
    const user = await User.findOne({username: req.params.id}, {blocked: 1});
    res.json(user);
}));

// blocks users
router.post("/api/block", tryCatch(async (req, res) => {
    const {blockUser, currentUser} = req.body;

    if (!blockUser || !currentUser) {
        throw new appError(FIELD_MISSING, "Fields must be filled!", 401);
    }

    if (blockUser === currentUser) {
        throw new appError(INVALID_CREDENTIALS, "Cannot block self!", 401);
    }

    // get both accounts
    const blockedAccount = await User.findOne({username: blockUser}, {username: 1, photo: 1})
    const currentAccount = await User.findOne({username: currentUser}, {username: 1, photo: 1, blocked: 1})
    if (!blockedAccount || !currentAccount) {
        throw new appError(USER_NOT_FOUND, "User not found!", 401);
    }

    // checks if user is already blocked, if so, remove from blocked, otherwise add to blocked
    const isBlocked = currentAccount.blocked.some(user => user.username === blockUser);
    if (isBlocked) {
       currentAccount.blocked = currentAccount.blocked.filter(user => user.username !== blockUser);
    } else {
        currentAccount.blocked.push({ username: blockUser, photo: blockedAccount.photo });
    }

    currentAccount.save();
    res.json({message: "User blocked successfully", status: "ok", blocked: currentAccount.blocked});
}));

module.exports = router;