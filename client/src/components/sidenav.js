import "../stylesheet/style.css";
import "../stylesheet/sidenav.css";
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CreateMessage from "../pages/createMessage";
import SearchUser from '../components/searchUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export default function Sidenav({setMessageIdHandler, showSidebar}) {    
    const [users, setUsers] = useState([]);
    //const [otherUserPhoto, setUserPhoto] = useState(''); //not in use currently
    const navigate = useNavigate();

    // handle sending message id to parent
    function handleClick(id, e) {
        localStorage.setItem('otherUser', e);
        setMessageIdHandler(id);
    }

    const [messages, setMessages] = useState([]);
    const [otherMembersPhotos, setOtherMembersPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateMessage, setShowCreateMessage] = useState(false);

    //  retrieves messages from the server that user has
    const getMessages = () => {
        axios.get('http://localhost:3000/api/messages/' + localStorage.getItem('username'), { withCredentials: true })
            .then(response => {
                const {message, otherMembersPhotos} = response.data;
                setMessages(message);
                setOtherMembersPhotos(otherMembersPhotos);
                setLoading(false);
                
            })
            .catch(error => {
                console.error(error);
            });
    };
    
    // populate messages
    useEffect(() => {
        getMessages();
    }, []);

    useEffect(() => {
        // fetch users data, gets user's messages
        axios.get('http://localhost:3000/api/messageUsers/' + localStorage.getItem('username'))
            .then(response => {
                const users = response.data;
                setUsers(users);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    // for searching a specific sidenav message, opens if found
    function findMessage(user, handler, otherUser) {
        messages.forEach(message => {
            if (message.members.includes(user)) {
                if (user !== localStorage.getItem('username')) {
                    handler(message._id, otherUser);
                }
            }
        });
    }

    // allows functionallity to the searchbar in sidenav, upon any option, attempt to find the message.
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

    // create new message
    function createMessage() {
        setShowCreateMessage(true);
    }

    // close create message
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
                    <div className = "load">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="sidenav-list">
                        {messages.map((message, index) => {
                            const otherUser = message.members.filter(member => member !== localStorage.getItem('username'))[0];
                            const otherUserPhoto = otherMembersPhotos.find(photo => photo.username === otherUser)?.photo;
                            return (
                                <button className="sidenav-button" key={index} onClick={() => {
                                    showSidebar(true); 
                                    handleClick(message._id, otherUser);
                                }}>
                                    <div className="sidenav-item">
                                        <img src={otherUserPhoto} alt="Avatar" />
                                        <div className="details">
                                            <h3>{otherUser}</h3>
                                            <div className = "reply-container">
                                                <p className= "reply-max-width">{message.recentMessage}</p>
                                            </div>
                                        </div>
                                        <div className="time">
                                            <p>{message.recentMessageTime}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
