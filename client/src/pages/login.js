import React, { useEffect, useState } from 'react';
import "../stylesheet/style.css";
import "../stylesheet/login.css";   
import { useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginRemember, setLoginRemember] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const submitForm = (e) => {
        e.preventDefault();
        //make a fetch request to the server
        axios.post('http://localhost:3000/api/login', {
            username: username,
            password: password,
            remember: loginRemember,
        }, { withCredentials: true }).then((res) => {
            //redirect to the home page
            navigate('/home');
        }).catch((err) => {
            //create an error message event
            const { message } = err.response.data;

            if (message === "Please fill in all fields") {
                document.querySelectorAll('.login-input input').forEach(element => {
                    if (element.value === '') {
                        element.style.color = 'red';
                        element.style.borderBottom = '1px solid red';
                    }
                });
                document.getElementById('error-message').innerText = message;
            }

            if (message === "Username or password is invalid") {
                document.querySelectorAll('.login-input input').forEach(element => {
                    element.style.color = 'red';
                    element.style.borderBottom = '1px solid red';
                });
                document.getElementById('error-message').innerText = message;
            }
        });
    }

    //if the user is redirected from the register page, set the username in the input field
    useEffect(() => {
        if (location.state) {
            setUsername(location.state.username);
            document.getElementById("username").value = location.state.username;
        }
    }, [location]);

    const resetColor = (e) => {
        e.target.style.color = '';
        e.target.style.borderBottom = '';
        document.getElementById('error-message').innerText = '';
    }

    return (
        <div className="login-container">
            <div className="login">
                <h1>Welcome Back!</h1>
                <div className = "login-error-message">
                    <p id = "error-message"></p>
                </div>
                <div className="login-input">
                    <input type="text" placeholder="Username" id = "username" onChange={(e) => setUsername(e.target.value)} autoComplete="on" onFocus={resetColor}/>
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} autoComplete="on" onFocus={resetColor}/>

                    <div className="login-extra">
                        <div className="login-remember">
                            <input type="checkbox" id="remember" name="remember" onChange={(e) => setLoginRemember(e.target.checked)}/>
                            <label htmlFor="remember">Remember Me</label>
                        </div>

                        <div className="login-forgot">
                            <a href="/forgot-password">Forgot Password?</a>
                        </div>
                    </div>
                    <button type="submit" onClick={submitForm}>LOGIN</button>
                </div>

                <div className="login-signup">
                    <p>Don't have an account? <a href = "/register">Sign Up</a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;