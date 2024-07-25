import "../stylesheet/message.css";
import "../stylesheet/style.css";
import EditMessageBox from "./editMesagebox";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

//socket.io
export default function MessageBox(message) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [parrentID, setParentID] = useState('');
    
    //populate messages
    useEffect(() => {
        if (message.messageID !== '') {
            axios.get(`http://localhost:3000/api/messages`, {
                params: {
                    messageID: message.messageID,
                }
            })
                .then((res) => {
                    setMessages(res.data);
                    setParentID(message.messageID);
                })
                .catch((err) => {
                    //show error
                    console.log(err);
                });
        }
    }, [message]);


    return (
        <div className="message-container">
            <div className="message-content">
            {messages.length != 0 ? (
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
                                <p>{message.message}</p>
                            </div>
                        </div>
                        <EditMessageBox messageID={message.id} parentMessageID={parrentID} />
                    </div>
                ))
            ) : (
                <div></div>
            )}
            </div>

            <div className="message-footer">
                <input type="text" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} />
                <button className="send-button">
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
        </div>
    );
}
