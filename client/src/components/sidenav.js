import "../stylesheet/style.css";
import "../stylesheet/sidenav.css";
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CreateMessage from "../pages/createMessage";
import SearchUser from '../components/searchUser';

export default function Sidenav({setMessageIdHandler}) {    
    const [users, setUsers] = useState([]);

    //handle sending message id to parent
    function handleClick(id) {
        setMessageIdHandler(id);
    }

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateMessage, setShowCreateMessage] = useState(false);
    const [newInput, setNewInput] = useState('');

    function getMessages() {
        axios.get('http://localhost:3000/api/messages/' + localStorage.getItem('username'))
            .then(response => {
                setMessages(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
            }
        );
    }

    //populate messages
    useEffect(() => {
      getMessages()
    }, []);

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


    //create new message
    function createMessage() {
        setShowCreateMessage(true);
    }

    //close create message
    function closeMessage() {
        setShowCreateMessage(false);
    }

    return (
        <>
            {showCreateMessage && <CreateMessage closeMessage={closeMessage} getMessages={getMessages}/>}
            <div className="sidenav-container">
                <div className="sidenav-header">
                    <div className="sidenav-inline">
                        <h2>Messages</h2>
                        <button className="sidenav-button" onClick={createMessage}>
                            <div className="tooltip">
                                <h1>+</h1>
                                <span className="tooltiptext">New Message</span>
                            </div>
                        </button>
                    </div>
                    <SearchUser users={users} placeholder="Search for message..." />
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="sidenav-list">
                        {messages.map((message, index) => (
                            <button className="sidenav-button" key={index} onClick={() => handleClick(message._id)}>
                                <div className="sidenav-item">
                                    <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" />
                                    <div className="details">
                                        <h3>{message.members.filter(member => member !== localStorage.getItem('username'))[0]}</h3>
                                        <p>{message.recentMessage}</p>
                                    </div>
                                    <div className="time">
                                        <p>{message.recentMessageTime}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
