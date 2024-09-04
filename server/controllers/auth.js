require('dotenv').config(); // for envconst IN_PRODUCTION = process.env.NODE_ENV === 'production';
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const appError = require('../utils/appError');
const { tryCatch } = require('../utils/tryCatch');
const { USER_NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../constants/constants');
//SendGrid
const forgetPassword = tryCatch(async (req, res) => {
    console.log(req.body);
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        throw new appError(USER_NOT_FOUND, 'User not found', 400);
    }

    //this works as intended, but gmail blocked the email will work on this stuff later
    const token = jwt.sign({userID: user._id}, process.env.JWT_KEY, {expiresIn: "10m"});

    const transporter = nodeMailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "chatapp reset password",
        html: `<h1>Reset Your Password</h1>
        <p>Click on the following link to reset your password:</p>
        <a href="http://localhost:3001/reset-password/${token}">http://localhost:3001/reset-password/${token}</a>
        <p>The link will expire in 10 minutes.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            throw new appError(INTERNAL_SERVER_ERROR, 'Email not sent', 500);
        }

        res.status(200).json({
            status: 'ok',
            message: 'Email sent',
        });

    });
});

const resetPassword = async (req, res) => {

};

module.exports = {
    forgetPassword,
    resetPassword
};
