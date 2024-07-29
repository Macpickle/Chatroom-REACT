import React, { useState, useEffect } from 'react';
import "../stylesheet/style.css";
import "../stylesheet/message.css";
import SearchUser from '../components/searchUser';
import axios from 'axios';

//closeMessage function from sidenav.js, closes this component
function CreateMessage({closeMessage, getMessages}) {
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        //fetch users
        axios.get('http://localhost:3000/api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

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
            const { message } = error.response.data
            
            if (message === 'Reciever is empty!') {
                document.getElementById('search-input').style.borderBottom = '1px solid red';
                document.getElementById('error-content').innerHTML = 'Reciever is empty!';
            }

            else if (message === 'Message is empty!') {
                document.querySelector('.create-message input').style.borderBottom = '1px solid red';
                document.getElementById('error-content').innerHTML = 'Message is empty!';
            }

            else if (message === 'Cannot send message to self') {
                document.getElementById('search-input').style.borderBottom = '1px solid red';
                document.querySelector('.create-message input').style.borderBottom = '1px solid red';
                document.getElementById('error-content').innerHTML = 'Cannot send message to self!';
            }

            else if (message === 'User does not exist') {
                document.getElementById('search-input').style.borderBottom = '1px solid red';
                document.getElementById('error-content').innerHTML = 'User does not exist!';
            }

            else if (message === 'Message already exists') {
                document.getElementById('search-input').style.borderBottom = '1px solid red';
                document.querySelector('.create-message input').style.borderBottom = '1px solid red';
                document.getElementById('error-content').innerHTML = 'Message already exists!';
            }
        }
        )
    }

    const resetColor = (e) => {
        e.target.style.color = '';
        e.target.style.borderBottom = '';
        document.getElementById('error-content').innerText = '';
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
                <div className = "error-message">
                    <p id="error-content"></p>
                </div>
                <SearchUser users={users} placeholder="Search for a user..." padding = {null}/>
                <div className = "create-message">
                    <input
                        type="text"
                        placeholder="Start a message..."
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={75}
                        onFocus={resetColor}
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