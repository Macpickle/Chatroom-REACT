import "../stylesheet/navbar.css";
import "../stylesheet/style.css";
import { useState, useEffect } from "react";
import { useNavigate} from 'react-router-dom';
import axios from "axios";

export default function Navbar() {
    // for current user data (photo)
    const [user, setUser] = useState('')
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // logout funcitonallity, fully removes user session and localstorage data
    const logoutUser = () => {
        localStorage.clear();
        axios.get('http://localhost:3000/api/logout').then(() => {
            navigate('/login');
        });
    }

    // gets current user data
    useEffect(() => {
        axios.get("http://localhost:3000/api/users/" + localStorage.getItem('username'))
        .then(response => {
            setUser(response.data);
            setLoading(false)
        })
        .catch(error => {
            console.error(error);
        });
    }, [])

    return (
        <div className="navbar-container">
            <h2>Chatroom</h2>
            {loading ? (
                <div></div>
            ) : (
                <div>
                    <div className="navbar-profile">
                        <img src={user.user.photo} alt="Avatar" />
                    </div>
                    <div className="navbar-dropdown">
                        <button className="navbar-dropdown-option" onClick = {() => navigate('/account')}>
                            <h2>Account</h2>
                        </button>
                        <button className="navbar-dropdown-option" onClick = {() => navigate('/settings')}>
                            <h2>Settings</h2>
                        </button>
                        <button className="navbar-dropdown-option" onClick = {() => navigate('/')}>
                            <h2>Home</h2>
                        </button>
                        <button className="navbar-dropdown-option" onClick={logoutUser}>
                            <h2>Logout</h2>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
