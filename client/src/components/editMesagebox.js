import "../stylesheet/message.css";
import "../stylesheet/style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faEllipsis, faReply } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios';
import socketIOClient from "socket.io-client";

export default function EditMessageBox({messageID, parentMessageID, updateChat}) {
    let socket = socketIOClient('http://localhost:3000');

    const deleteMessage = () => {
        console.log(messageID);
        axios.post('http://localhost:3000/api/deleteMessage', {
            messageID: messageID,
            parentMessageID: parentMessageID
        }).then((res) => {
            updateChat();
            socket.emit('delete');
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <div className = "edit-content">
            <button className="edit-button" onClick = {deleteMessage}>
                <div className = "tooltip">
                    <div className = "icon">
                        <FontAwesomeIcon icon={faTrash}/>
                    </div>
                    <span className = "tooltiptext">Delete</span>
                </div>
            </button>
            <button className="edit-button">
                <div className = "tooltip">
                    <div className = "icon">
                        <FontAwesomeIcon icon={faEdit}/>
                    </div>
                    <span className = "tooltiptext">Edit</span>
                </div>
            </button>
            <button className="edit-button">
                <div className = "tooltip">
                    <div className = "icon">
                        <FontAwesomeIcon icon={faReply}/>
                    </div>
                    <span className = "tooltiptext">Reply</span>
                </div>
            </button>
            <button className="edit-button">
                <div className = "tooltip">
                    <div className = "icon">
                        <FontAwesomeIcon icon={faEllipsis}/>
                    </div>
                    <span className = "tooltiptext">More</span>
                </div>
            </button>
        </div>
    )

}




