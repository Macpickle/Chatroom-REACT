import "../stylesheet/style.css";
import "../stylesheet/sidenav.css";
import React, { useCallback } from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CreateMessage from "../pages/createMessage";
import SearchUser from '../components/searchUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export default function Sidenav({setMessageIdHandler, showSidebar}) {    
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    //handle sending message id to parent
    function handleClick(id, e) {
        localStorage.setItem('otherUser', e);
        setMessageIdHandler(id);
    }

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateMessage, setShowCreateMessage] = useState(false);

    /*
    *   retrieves messages from the server that user has
    *   returns voidd
    */
    const getMessages = () => {
        axios.get('http://localhost:3000/api/messages/' + localStorage.getItem('username'), { withCredentials: true })
            .then(response => {
                setMessages(response.data);
                setLoading(false);
            })
            .catch(error => {
                const {message} = error.response.data
                if (message === "User was not set properly.") {
                    localStorage.clear();
                    axios.get('http://localhost:3000/api/logout').then(() => {
                        navigate('/login');
                    });
                }
        });
    };
    
    //populate messages
    useEffect(() => {
        getMessages();
    }, []);

    useEffect(() => {
        //fetch users
        axios.get('http://localhost:3000/api/messageUsers/' + localStorage.getItem('username'))
            .then(response => {
                const users = response.data;
                setUsers(users);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    function findMessage(user, handler, otherUser) {
        messages.forEach(message => {
            if (message.members.includes(user)) {
                if (user !== localStorage.getItem('username')) {
                    handler(message._id, otherUser);
                }
            }
        });
    }

    useEffect(() => {
        document.getElementById('search-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                findMessage(e.target.value, handleClick, e.target.value);
            }
        });

        document.getElementById('search-results').addEventListener('click', (e) => {
            findMessage(e.target.innerText, handleClick, e.target.innerText);
        });

        document.getElementById('search-button').addEventListener('click', (e) => {
            findMessage(document.getElementById('search-input').value, handleClick, document.getElementById('search-input').value);
        });
    });

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
            <div className="sidenav-container" id = "sidenav">
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
                    <SearchUser users={users} placeholder="Search for message..." padding={"1.5rem"}/>
                    <div className = "search-icon">
                        <div className = "tooltip">
                            <button className = "search-button" id = "search-button">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                            </button>
                            <span className="tooltiptext">Search</span>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div></div>
                ) : (
                    <div className="sidenav-list">
                        {messages.map((message, index) => (
                            <button className="sidenav-button" key={index} onClick={() => {
                                showSidebar(true); 
                                handleClick(message._id, message.members.filter(member => member !== localStorage.getItem('username'))[0]);
                            }}>
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
