import "../stylesheet/message.css";
import "../stylesheet/style.css";
import EditMessageBox from "./editMesagebox";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socketIOClient from "socket.io-client";

export default function MessageBox(message) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [parrentID, setParentID] = useState('');
    let socket = socketIOClient('http://localhost:3000');

    const updateChat = () => {
        axios.get(`http://localhost:3000/api/messages`, {
            params: {
                messageID: message.messageID,
            }
        })
            .then((res) => {
                setMessages(res.data);
                setParentID(res.data.messages._id);
            })
            .catch((err) => {
                //show error
                console.log(err);
        });
    }
    
    useEffect(() => {
        socket.on('message', (data) => {
            if (messages.messages) {
                // for whatever reason this is the only way to live update, even with using updateChat, will fix later.
                const messagesCopy = [...messages.messages.messages];
                messagesCopy.push(data);
                setMessages({messages: {messages: messagesCopy}});
                setInput(''); //sets all users to '', fix
            }

        });

        //not working
        //socket.on('delete', (data) => {
        //    updateChat();
        //})
    }, [messages]);

    //populate messages
    useEffect(() => {
        if (message.messageID !== '') {
            updateChat()
        }
    }, [message]);

    const submitMessage = () => {
        axios.post(`http://localhost:3000/api/message`, {
            members: [localStorage.getItem('username'), localStorage.getItem('otherUser')],
            message: input,
            sender: localStorage.getItem('username'),
            reciever: localStorage.getItem('otherUser'),
        })

        socket.emit('message', {
            message: input,
            sender: localStorage.getItem('username'),
            time: new Date().toLocaleTimeString(),
        });
    };

    useEffect(() => {
        //scroll to bottom of messages
        const messages = document.getElementById('messages');
        messages.scrollTop = messages.scrollHeight;
    }, [messages]);

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
                                <p>{message.message}</p>
                            </div>
                        </div>
                        <EditMessageBox messageID={message._id} parentMessageID={parrentID} updateChat={updateChat}/>
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
                <button className="send-button" onClick = {() => submitMessage()}>
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
