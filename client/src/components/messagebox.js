import "../stylesheet/message.css";
import "../stylesheet/style.css";
import EditMessageBox from "./editMesagebox";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

// message menu
export default function MessageBox({messageID, socketConnection, showSidebar}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [parentID, setParentID] = useState('');
    const [editMessageID, setEditID] = useState('');
    const [replying, setReply] = useState('');
    const [blocked, setBlocked] = useState(false);
    const [otherMembersPhotos, setOtherMembersPhotos] = useState([]);

    // changes state of editing message, while also setting the editMessageID
    const editMessage = (data) => {
         setEditID(data)
    };

    // displays reply prompt if message was a reply to another
    const replyMessage = (messageID, parentID) => {
        axios.get('http://localhost:3000/api/findMessage/' + messageID + '/' + parentID)
        .then(response => {
            const message = document.getElementById(response.data._id);
            setReply(response.data);
            document.getElementById('message-text-box').focus();
            message.style.backgroundColor = document.documentElement.style.getPropertyValue("--background-hover");
            function handleKeydown (e) {   
                if (e.key === "Escape") {
                    document.removeEventListener('keydown', handleKeydown);
                    setReply('');
                    message.style.backgroundColor = '';
                }
            };
            document.addEventListener('keydown', handleKeydown);
        })
        .catch(error => {
            console.error(error);
        });
        setReply(messageID);     
    };

    // retrieves messageID's message content
    const getMessages = useCallback(() => {
        if (!messageID) return;

        axios.get('http://localhost:3000/api/messages', {
                params: {
                    messageID: messageID,
                }
            })
            .then(response => {
                const { messages, otherMembersPhotos } = response.data;
                setMessages(messages.messages);
                setParentID(messages._id);
                setOtherMembersPhotos(otherMembersPhotos);
                socketConnection.emit('join', messages._id);
            })
            .catch(error => {
                console.error(error);
        });

        axios.get('http://localhost:3000/api/isBlocked/' + localStorage.getItem('otherUser') + '/' + localStorage.getItem('username'))
        .then(response => {
            setBlocked(response.data);
        }).catch(error => {
            console.log(error);
        });

        return () => {
            socketConnection.emit('leave', parentID);
        }
    }, [messageID, blocked]);

    
    // sends message to database, then shows via websocket
    const sendMessage = (chatbotMessage) => {
        axios.post(`http://localhost:3000/api/message`, {
            members: [localStorage.getItem('username'), localStorage.getItem('otherUser')],
            message: input,
            sender: localStorage.getItem('username'),
            reciever: localStorage.getItem('otherUser'),
            reply: replying,
        }).then(response => { 
            setReply('');
            setInput('');
            socketConnection.emit('message', response.data.messageContent, parentID);

            if (chatbotMessage) {
                axios.post(`http://localhost:3000/api/chatTest`, {
                    body: {
                        members: [localStorage.getItem('username'), localStorage.getItem('otherUser')],
                        message: response.data.messageContent,
                        sender: localStorage.getItem('otherUser'),
                        reciever: localStorage.getItem('username'),
                    }
                }).then(response => {
                    setReply('');
                    socketConnection.emit('message', response.data.messageContent, parentID);
                }).catch(err => {
                    console.log(err);
                })
            }

        });
    };

    // checks if the messageID prop has changed
    useEffect(() => {
        if (messageID) {
            getMessages();
        }
    }, [messageID, getMessages]);

    // deals with live updates to users
    useEffect(() => {
        //setMessages(prevMessages => [...prevMessages, data])
        socketConnection.on('message', (data) => {setMessages(prevMessages => [...prevMessages, data])});
        socketConnection.on('delete', (data) => getMessages());
        return () => {
            socketConnection.off('message');
            socketConnection.off('delete');
        }
    }, []);

    // onload, scroll to the bottom of the message container
    useEffect(() => {
        const messages = document.getElementById('messages');
        messages.scrollTop = messages.scrollHeight;
    }, [messages]);

    // sets focus on input if editing message
    useEffect(() => {
        if (editMessageID) {
            const inputField = document.getElementById("editMessage");
            inputField.focus();

            inputField.addEventListener('keydown', (e) => {
                if (e.key === "Enter"){
                    axios.post('http://localhost:3000/api/editMessage', {
                        messageID: editMessageID,
                        parentID: parentID,
                        message: inputField.value
                    }).then((res) => {
                        getMessages();
                        setEditID('');                   
                    }).catch((error) => {
                        console.log(error);
                    });
                }

                if (e.key === "Escape"){
                    setEditID('');
                }
            });
        }
    },  [editMessageID, socketConnection, parentID])

    return (
        <div className="message-container" id = "message">
            <div className = "message-mobile-container">
                <button className = "message-mobile-icon" onClick = {() => showSidebar(false)}><FontAwesomeIcon icon={faArrowLeft}/></button>
                <div className = "message-mobile-user">{localStorage.getItem('otherUser')}</div>
            </div>
            <div className="message-content" id = "messages">
            {messages.length !== 0  || parentID ? (
                messages.map((message, index) => (
                    <div className="message" key={index} id = {message._id}>
                        <div className="profile-pic">
                            <img src={(otherMembersPhotos.filter(messageOwner => messageOwner.username === message.sender))[0].photo} alt="Avatar" />
                        </div>
                        <div className="message-text">
                            <div className="message-header">
                                <h2 className="profile-name">{message.sender}</h2>
                                <div className="message-time">
                                    <p>- {message.time}</p>
                                </div>
                                    {message.reply && (
                                        <div className = "reply-container">
                                            <div className = "reply-line"><FontAwesomeIcon icon={faArrowRight}/></div>
                                            <p className = "reply-max-width">{message.reply.message}</p>
                                        </div>
                                    )}
                            </div>
                            <div className="message-body">
                                { editMessageID !== message._id ? (
                                    <p>{message.message}</p>
                                    ) : ( 
                                        <input 
                                            id = "editMessage" 
                                            className = "editMessage" 
                                            type="text" 
                                            defaultValue={message.message} 
                                            onBlur = {() => setEditID('')}
                                        />
                                    )
                                }
                            </div>
                        </div>
                            <EditMessageBox 
                                messageID={message._id} 
                                parentMessageID={parentID} 
                                getMessages={getMessages} 
                                socketConnection={socketConnection}
                                editMessage={editMessage} 
                                replyMessage={replyMessage}
                                owner={localStorage.getItem('username') === message.sender}
                            />
                    </div>
                ))
            ) : (
                <div className = "no-message-information-container">
                    <div className = "no-message-information">
                        <h1>Click on a person on the sidebar to open a message!</h1>
                    </div>
                </div>
            )}
            
            { messages.length !== 0 || parentID ? (
            <div className="message-footer" id = "footer">
                { replying && (
                    <div className = "reply-notify">
                        <p>Replying to: {replying.sender}</p>
                    </div>
                )}
                {blocked && (
                    <p className = "blocked">you or another user has blocked this chat!</p>
                )}
                <input id = "message-text-box" type="text" placeholder="Type a message..." autoComplete="false" value={input} onChange={(e) => setInput(e.target.value)} disabled={blocked}/>
                <button className="send-button" onClick = {() => 
                    {
                        var aiMessage = false;
                        if (localStorage.getItem('otherUser') === "Chatbot") {aiMessage = true}
                        sendMessage(aiMessage);                    
                    }
                } disabled={blocked}>
                    <div className="tooltip">
                        <h2>Send</h2>
                        <span className="tooltiptext">Send Message</span>
                    </div>
                </button>

                {/* <button className="attach-button">
                    <div className="tooltip">
                        <h2>+</h2>
                        <span className="tooltiptext">Attach File</span>
                    </div>
                </button> */}
            </div>
            ) : (
                <div></div>
            )}
            
            </div>
 
        </div>
    );
}
