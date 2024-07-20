import React, { useState } from 'react';
import axios from 'axios';
import "../stylesheet/style.css";
import "../stylesheet/password-reset.css";

function ForgotPassword() {
    const [email, setEmail] = useState('');

    const submitForm = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3000/api/forget-password', { email: email })
            .then(res => {
                //success
                const { status, message } = res.data;
                console.log(status, message);
            })
            .catch(err => {
                const {message } = err.response.data;

                if (message === "User not found") {
                    document.getElementById('error-message').innerText = message;
                    document.getElementById('email').style.borderColor = 'red';
                }
            });
    }

    const onFocus = () => {
        document.getElementById('error-message').innerText = '';
        document.getElementById('email').style.borderColor = '';
    }

    return (
        <div>
            <div className="reset-password-container">
                <div className="reset-password">
                    <h1>Reset Password</h1>
                    <p>Enter your email associated with your account, then an email will be sent for you to reset your password.</p>
                    <div className="reset-password-input">
                        <p id="error-message"></p>
                        <input type="email" id="email" placeholder='Email...' onChange={(e) => setEmail(e.target.value)} onFocus={onFocus} />
                    </div>
                    <button type="submit" onClick={submitForm}>Reset Password</button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;