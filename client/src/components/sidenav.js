import "../stylesheet/style.css";
import "../stylesheet/sidenav.css";
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Sidenav({setMessageIdHandler}) {
    //handle sending message id to parent
    function handleClick(id) {
        setMessageIdHandler(id);
    }

    const [messages, setMessages] = useState([]);

    //populate messages
    useEffect(() => {
      axios.get('http://localhost:3000/api/messages', {
        params: {
          username: localStorage.getItem('username')
        }
      })
        .then(response => {
          setMessages(response.data);
        })
        .catch(error => {
          console.error(error);
        });
    }, []);

    const [newInput, setNewInput] = useState('');
    return (
        <div className="sidenav-container">
            <div className="sidenav-header">
                <div className="sidenav-inline">
                    <h2>Messages</h2>
                    <button className="sidenav-button">
                        <div className="tooltip">
                            <h1>+</h1>
                            <span className="tooltiptext">New Message</span>
                        </div>
                    </button>
                </div>
                <div className="sidenav-search">
                    <input
                        type="text"
                        placeholder="Find User..."
                        value={newInput}
                        onChange={(e) => {
                            setNewInput(e.target.value);
                        }}
                    />
                </div>
            </div>

            <div className="sidenav-list">
                {messages.length > 0  ? (
                    messages.map((message, index) => (
                        <button className="sidenav-button" key={index} onClick={() => handleClick(message._id)}>
                            <div className="sidenav-item">
                                <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" />
                                <div className="details">
                                    <h3>{message.otherUser}</h3>
                                    <p>{message.lastMessage}</p>
                                </div>
                                <div className="time">
                                    <p>{message.lastMessageTime}</p>
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <p>No messages found.</p>
                )}
            </div>
        </div>
    );
}
