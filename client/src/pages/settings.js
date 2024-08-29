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
  const [error, setError] = useState(''); //for error messaging
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

    //reset colouring if error message is present
    event.target.style.borderBottom = "";
    event.target.style.color = "";
    setError('');
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
      const {message} = error.response.data;
      setError(message);

      if (message === "Username is already taken!"){
        document.getElementById("username").style.borderBottom = "2px solid red";
        document.getElementById("username").style.color = "red";
      }

      else if (message === "Old password is required!"){
        document.getElementById("oldPassword").style.borderBottom = "2px solid red";
        document.getElementById("oldPassword").style.color = "red";
      }

      else if (message === "New password is required!"){
        document.getElementById("newPassword").style.borderBottom = "2px solid red";
        document.getElementById("newPassword").style.color = "red";
      }

      else if (message === "Incorrect Password"){
        document.getElementById("oldPassword").style.borderBottom = "2px solid red";
        document.getElementById("oldPassword").style.color = "red";
      }

      else if (message === "Email is already in use!"){
        document.getElementById("email").style.borderBottom = "2px solid red";
        document.getElementById("email").style.color = "red";
      }

      else if (message === "Invalid email format"){
        document.getElementById("email").style.borderBottom = "2px solid red";
        document.getElementById("email").style.color = "red";
      }
    });
  }

  useEffect(() => {
    if (status) {
      setTimeout(() => {
        setStatus('');
      }, 5000);
    }
  }, [status]);

  function showSubscreen(val) {
    setSubscreen(true);
    if (val === "Blocked"){
      setTitle("Viewing Blocked...");
      setMethod(val);
    }
    else if (val === "Photo"){
      setTitle("Updating Profile Picture...");
      setMethod(val);
    } else if (val === "Delete"){
      setTitle("Deleting Account...");
      setMethod(val);
    } else {
      //unknown method
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
                  <button className="setting-button" onClick={() => navigate("/account")} type="button">
                    <FontAwesomeIcon icon={faArrowLeft}/>
                  </button>
                  <span className="tooltiptext">Back</span>
                </div>
              </div>
              <div className="setting-title">
                <h2>Settings</h2>
              </div>
              <div className = "error">
                <p className = "error-message"> {error}</p>
              </div>
              <div className="setting-content">
                <div className="setting-item">
                  <h3>Change Name</h3>
                  <input type="text" name="username" placeholder='New Username...' maxLength={30} onChange={handleChange} id ="username"></input>
                </div>
                <div className="setting-item">
                  <h3>Change Password</h3>
                  <div className="setting-inline">
                    <input type="password" name="newPassword" placeholder='New Password...' maxLength={20} onChange={handleChange} id = "newPassword"></input>
                    <input type="password" name="oldPassword" placeholder='Old Password...' maxLength={20} onChange={handleChange} id = "oldPassword"></input>
                  </div>
                </div>
                <div className="setting-item">
                  <h3>Change Email</h3>
                  <input type="text" name="email" placeholder='New Email...' maxLength={30} onChange={handleChange} id = "email"></input>
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
                  <button className="button" type = "button" onClick = {() => showSubscreen("Delete")} >Delete Account</button>
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