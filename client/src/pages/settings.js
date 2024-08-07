import Navbar from '../components/navbar.js';
import '../stylesheet/settings.css';
import '../stylesheet/style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Settings() {
  const navigate = useNavigate();

  function submitForm(event) {
    console.log(event.target);
    axios.post('http://localhost:3000/api/settings', {
      body: {
        event: event.target
      }
    }).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  }

  const [formData, setFormData] = useState({
    username: '',
    newPassword: '',
    oldPassword: '',
    email: '',
    profilePicture: '',
    blockedUsers: '',
    theme: '',
    language: '',
    deleteAccount: ''
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  function submitForm(event) {
    event.preventDefault();
    axios.post('http://localhost:3000/api/settings', {
      formData: formData,
      username: localStorage.getItem('username')
    }).then(response => {
      console.log(response);
      window.location.reload();

    }).catch(error => {
      console.log(error);
    });
  }

  return (
    <div>
      <Navbar/>
      <form onSubmit={submitForm}>
        <div className="setting-container">
          <div className="setting-box">
            <div className="setting-header">
              <div className="tooltip">
                <button className="setting-button" onClick={() => navigate("/account")}>
                  <FontAwesomeIcon icon={faArrowLeft}/>
                </button>
                <span className="tooltiptext">Back</span>
              </div>
            </div>
            <div className="setting-title">
              <h2>Settings</h2>
            </div>
            <div className="setting-content">
              <div className="setting-item">
                <h3>Change Name</h3>
                <input type="text" name="username" placeholder='New Username...' maxLength={30} onChange={handleChange}></input>
              </div>
              <div className="setting-item">
                <h3>Change Password</h3>
                <div className="setting-inline">
                  <input type="password" name="newPassword" placeholder='New Password...' maxLength={20} onChange={handleChange}></input>
                  <input type="password" name="oldPassword" placeholder='Old Password...' maxLength={20} onChange={handleChange}></input>
                </div>
              </div>
              <div className="setting-item">
                <h3>Change Email</h3>
                <input type="text" name="email" placeholder='New Email...' maxLength={30} onChange={handleChange}></input>
              </div>
              <div className="setting-item">
                <h3>Change Profile Picture</h3>
                <button className="button">Edit Picture</button>
              </div>
              <div className="setting-item">
                <h3>View Blocked Users</h3>
                <button className="button">View Blocked</button>
              </div>
              <div className="setting-item">
                <h3>Theme</h3>
                <select className="button" name="theme" onChange={handleChange}>
                  <option value="">Select an Option</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="setting-item">
                <h3>Language</h3>
                <select className="button" name="language" onChange={handleChange}>
                  <option value="">Select an Option</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
              <div className="setting-item">
                <h3>Delete Account</h3>
                <button className="button">Delete Account</button>
              </div>
            </div>
            <div className="setting-footer">
              <button className="button">Save Changes</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Settings;