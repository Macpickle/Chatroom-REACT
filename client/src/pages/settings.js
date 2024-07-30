import Navbar from '../components/navbar.js';
import '../stylesheet/settings.css';
import '../stylesheet/style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Settings() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar/>
      <div className = "setting-container">
        <div className = "setting-box">
          <div className = "setting-header">
            <div className = "tooltip">
              <button className = "setting-button" onClick = {() => navigate("/account")}>
                <FontAwesomeIcon icon = {faArrowLeft}/>
              </button>
              <span className = "tooltiptext">Back</span>
            </div>
          </div>
          <div className = "setting-title">
              <h2>Settings</h2>
            </div>
          <div className = "setting-content">
            <div className = "setting-item">
              <h3>Change Name</h3>
              <input type="text" placeholder='New Username...' maxLength={30}></input>
            </div>
            <div className = "setting-item">
              <h3>Change Password</h3>
              <div className = "setting-inline">
                <input type="password" placeholder='New Password...' maxLength={20}></input>
                <input type="password" placeholder='Old Password...' maxLength={20}></input>
              </div>
            </div>
            <div className = "setting-item">
              <h3>Change Email</h3>
              <input type="text" placeholder='New Email...' maxLength={30}></input>
            </div>
            <div className = "setting-item">
              <h3>Change Profile Picture</h3>
              <button className = "button">Edit Picture</button>
            </div>
            <div className = "setting-item">
              <h3>View Blocked Users</h3>
              <button className = "button">View Blocked</button>
            </div>
            <div className = "setting-item">
              <h3>Theme</h3>
              <select className = "button">
                <option value = "dark">Dark</option>
                <option value = "light">Light</option>
                <option value = "system">System</option>
              </select>
            </div>
            <div className = "setting-item">
              <h3>Language</h3>
              <select className = "button">
                <option value = "English">English</option>
                <option value = "French">French</option>
                <option value = "Spanish">Spanish</option>
              </select>
            </div>
            <div className = "setting-item">
              <h3>Delete Account</h3>
              <button className = "button">Delete Account</button>
            </div>
          </div>
          <div className = "setting-footer">
            <button className = "button">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;