import "../stylesheet/message.css";
import "../stylesheet/style.css";
import EditMessageBox from "./editMesagebox";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function MessageBox({messageID, socketConnection}) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [editField, setEditField] = useState('');
    const [parrentID, setParentID] = useState('');
    const [editMessageID, setEditID] = useState('');

    /*
    *   changes state of editing message, while also setting the editMessageID
    *   returns void
    */
   const editMessage = (data) => {
        setEditID(data)
   };

    /*
    *   retrieves messageID's message content
    *   returns void
    */
    const getMessages = useCallback(() => {
        axios.get('http://localhost:3000/api/messages', {
                params: {
                    messageID: messageID,
                }
            })
            .then(response => {
                setMessages(response.data);
                setParentID(response.data.messages._id);
            })
            .catch(error => {
                console.error(error);
        });
    }, [messageID]);

    /*
    *  updates messages on the client end 
    *  returns void
    */
    const updateMessages = useCallback(() => {
        if (messages !== "") {
            console.log(messages);
            getMessages();
        }
    }, [messages, getMessages]);

    /*
    *   sends message to database, then shows via websocket
    *   returns void
    */
    const sendMessage = useCallback(() => {
        axios.post(`http://localhost:3000/api/message`, {
            members: [localStorage.getItem('username'), localStorage.getItem('otherUser')],
            message: input,
            sender: localStorage.getItem('username'),
            reciever: localStorage.getItem('otherUser'),
        }).then(response => { 
            socketConnection.emit('message');
        });
    }, [input, socketConnection]);

    // checks if the messageID prop has changed
    useEffect(() => {
        if (messageID) {
            getMessages();
        }
    }, [messageID, getMessages]);

    // deals with live updates to users
    useEffect(() => {
        socketConnection.on('message', (data) => {
            updateMessages();         
        });

        socketConnection.on('delete', (data) => {
            updateMessages();
        });

    }, [messages, socketConnection, updateMessages])

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
                        parrentID: parrentID,
                        message: inputField.value
                    }).then((res) => {
                        socketConnection.emit('message');
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
    },  [editMessageID, socketConnection])

    return (
        <div className="message-container">
            <div className="message-content" id = "messages">
            {messages.length !== 0 ? (
                messages.messages.messages.map((message, index) => (
                    <div className="message" key={index}>
                        <div className="profile-pic">
                            <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" />
                        </div>
                        <div className="message-text">
                            <div className="message-header">
                                <h2 className="profile-name">{message.sender}</h2>
                                <div className="message-time">
                                    <p>- {message.time}</p>
                                </div>
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
                        {localStorage.getItem('username') === message.sender && (
                            <EditMessageBox messageID={message._id} parentMessageID={parrentID} updateMessages={updateMessages} socketConnection={socketConnection} editMessage={editMessage}/>
                        )}
                    </div>
                ))
            ) : (
                <div className = "no-message-information-container">
                    <div className = "no-message-information">
                        <h1>Click on a person on the sidebar to open a message!</h1>
                    </div>
                </div>
            )}
            
            { messages.length !== 0 ? (
            <div className="message-footer" id = "footer">
                <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
                <button className="send-button" onClick = {() => sendMessage()}>
                    <div className="tooltip">
                        <h2>Send</h2>
                        <span className="tooltiptext">Send Message</span>
                    </div>
                </button>
                <button className="attach-button">
                    <div className="tooltip">
                        <h2>+</h2>
                        <span className="tooltiptext">Attach File</span>
                    </div>
                </button>
            </div>
            ) : (
                <div></div>
            )}
            
            </div>
 
        </div>
    );
}
