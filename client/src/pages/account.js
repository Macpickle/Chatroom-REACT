import Navbar from '../components/navbar.js';
import '../stylesheet/account.css';
import '../stylesheet/style.css'
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

function Account() {
  // for data showing
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetches user data, and sets loading to false to show data
  useEffect(() => {
      axios.get('http://localhost:3000/api/users/' + localStorage.getItem('username'))
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    (loading) ? <div></div> : (
      <div>
        <Navbar/>
          <div className = "account-container">
            <div className = "account-box">
              <div className = "account-content">
                <div className = "account-photo">
                  <img src={user.user.photo} alt=""></img>
                </div>
                <h2> Hello, {user.user.username}! </h2>
                <div className = "account-options">
                  <button onClick = {() => navigate("/settings")}>Settings</button>
                  <button onClick = {() => navigate("/")}>Home</button>
                </div>
              </div>
            </div>

          </div>
      </div>
    )
  );
}

export default Account;