import Navbar from '../components/navbar.js';
import Subscreen from '../components/settingSubscreen.js'
import '../stylesheet/settings.css';
import '../stylesheet/style.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import theme from '../themeSetter.js';

function Settings() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [subscreen, setSubscreen] = useState(false);
  const [title, setTitle] = useState(''); //for subscreen title element
  const [method, setMethod] = useState(''); //for subscreen, responsible on changing subscreen based on what method is used

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
      setStatus(response.data.message);

      //sets theme, if changed will update the pages' theme
      theme();

    }).catch(error => {
      const { message } = error.response.data;
    });
  }

  useEffect(() => {
    if (status) {
      setTimeout(() => {
        setStatus('');
      }, 5000);
    }
  });

  function showSubscreen(val) {
    setSubscreen(true);
    if (val == "Blocked"){
      setTitle("Viewing Blocked...");
      setMethod(val);
    }
    else if (val == "Photo"){
      setTitle("Updating Profile Picture...");
      setMethod(val);
    } else {
      //unexpected error, add error messaging
    }
  }

  function closeSubscreen() {
    setSubscreen(false);
  }

  return (
    <div>
      {
        status.length !== 0 ? (
          <div className="alert-container">
            <div className = "alert">
              <p>{status}</p>
            </div>
          </div>
        ) : (
          <div></div>
        )
      }
      <div>
        <Navbar/>
        {subscreen && <Subscreen closeSubscreen={closeSubscreen} title={title} method={method}/>}
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
                  <button className="button" type = "button" onClick = {() => showSubscreen("Photo")}>Edit Picture</button>
                </div>
                <div className="setting-item">
                  <h3>View Blocked Users</h3>
                  <button className="button" type = "button" onClick = {() => showSubscreen("Blocked")}>View Blocked</button>
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
    </div>
  );
}

export default Settings;