import React, { useState } from 'react';
import "../stylesheet/style.css";
import "../stylesheet/login.css";  
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const submitForm = (e) => {
        e.preventDefault();
        //make a fetch request to the server
        axios.post('http://localhost:3000/api/register', {
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        }
        ).then((res) => {
            //create a message with the chatbot
            axios.post('http://localhost:3000/api/messages', {
                members: [res.data.username, 'Chatbot'],
                message: 'Hello! I am the chatbot. How can I help you today?',
                sender: 'Chatbot',
                reciever: res.data.username
            }).then(() => { 
                navigate('/', { state: { username: res.data.username } });
            });
        }).catch((err) => {
            //create an error message event
            const { message } = err.response.data;
            console.log(err.response.data);

            if (message === "Please fill in all fields") {
                document.querySelectorAll('.login-input input').forEach(element => {
                    if (element.value === '') {
                        element.style.color = 'red';
                        element.style.borderBottom = '1px solid red';
                    }
                });
                document.getElementById('error-message').innerText = message;
            }

            if (message === "Passwords do not match") {
                document.querySelector('#password').style.color = 'red';
                document.querySelector('#password').style.borderBottom = '1px solid red';
                document.querySelector('#passwordConfirm').style.color = 'red';
                document.querySelector('#passwordConfirm').style.borderBottom = '1px solid red';
                document.getElementById('error-message').innerText = message;
            };

            if (message === "User already exists") {
                document.querySelector('.login-input input').style.color = 'red';
                document.querySelector('.login-input input').style.borderBottom = '1px solid red';
                document.getElementById('error-message').innerText = message;
            }

            if (message === "Invalid email format") {
                document.querySelectorAll('.login-input input')[1].style.color = 'red';
                document.querySelectorAll('.login-input input')[1].style.borderBottom = '1px solid red';
                document.getElementById('error-message').innerText = message;
            }
        });
    }

    //reset the color of the input fields, eg. to revert from errors
    const resetColor = (e) => {
        e.target.style.color = '';
        e.target.style.borderBottom = '';
        document.getElementById('error-message').innerText = '';
    }

    return (
        <div className="login-container">
            <div className="login">
                <h1>Sign Up</h1>
                <div className = "login-error-message">
                    <p id = "error-message"></p>
                </div>
                <div className="login-input">
                    <input type="text" placeholder="Username" autoComplete="on" onChange={(e) => setUsername(e.target.value)} onFocus={resetColor} />
                    <input type="email" placeholder="Email" autoComplete="on" onChange={(e) => setEmail(e.target.value)} onFocus={resetColor} />
                    <input id="password" type="password" placeholder="Password" autoComplete="on" onChange={(e) => setPassword(e.target.value)} onFocus={resetColor} />
                    <input id="passwordConfirm" type="password" placeholder="Confirm Password" autoComplete="on" onChange={(e) => setConfirmPassword(e.target.value)} onFocus={resetColor} />
                    <button type="submit" onClick={submitForm}>SIGN UP</button>
                </div>

                <div className="login-signup">
                    <p>Already have an account? <a href="/">Login</a></p>
                </div>
            </div>
        </div>
    );
}

export default Register;