import "../stylesheet/message.css";
import "../stylesheet/style.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faEllipsis, faReply } from '@fortawesome/free-solid-svg-icons'

export default function EditMessageBox(messageID, parentMessageID) {
    return (
        <div className = "edit-content">
            <button className="edit-button">
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




