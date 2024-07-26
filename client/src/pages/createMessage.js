import React, { useState } from 'react';
import "../stylesheet/style.css";
import "../stylesheet/message.css";
import SearchUser from '../components/searchUser';
import axios from 'axios';

//closeMessage function from sidenav.js, closes this component
function CreateMessage({closeMessage, getMessages}) {
    const [message, setMessage] = useState("");

    function createNewMessage() {
        const user = localStorage.getItem('username')
        const reciever = document.getElementById('search-input').value
        axios.post('http://localhost:3000/api/messages', {
            members: [user, reciever],
            message: message,
            sender: user,
            reciever: reciever
        }).then(response => {
            closeMessage();
            getMessages();
            
        }).catch((error) => {
            console.log(error.response.data)
        }
        )
    }

    return (
        <div className="create-message-container">
            <div className="create-message-content">
                <button className="back-button" onClick={closeMessage}>
                    <div className="tooltip">
                        <h1>x</h1>
                        <span className="tooltiptext">Close</span>
                    </div>
                </button>
                <h2>Create Message</h2>
                <SearchUser />
                <div className = "create-message">
                    <input
                        type="text"
                        placeholder="Start a message..."
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={75}
                    />
                </div>
                <div className = "create-button-container">
                    <button onClick={createNewMessage}>
                        <h3>Send</h3>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateMessage;