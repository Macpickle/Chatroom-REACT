import "../stylesheet/subscreen.css"
import { useEffect, useState } from 'react';
import axios from 'axios';


function Subscreen({closeSubscreen, title, method}) {
    const [photo, setphoto] = useState('');

    useEffect(() => {
        axios.get('http://localhost:3000/api/profilepicture/' + localStorage.getItem('username'))
            .then(response => {
                const profilePic = response.data.photo;
                setphoto(profilePic);
            })
            .catch(error => {
                console.error(error);
            });
    });

    return (
    <div className = "subscreen-container">
        <div className="subscreen">
            <button className="back-button" onClick={closeSubscreen}>
                <div className="tooltip">
                    <h1>x</h1>
                    <span className="tooltiptext">Close</span>
                </div>
            </button>
            <h2>{title}</h2>

            {method === "Photo" ? (
            <div className = "subscreen-photo-container">
                <div className = "subscreen-photo">
                    <img src={photo} alt = "profile"/>
                </div>
                <input type = "file" id = "file-input"/>
                <label for="file-input">Select file</label>
            </div>
            ) : (
                <div></div>
            )}
        </div>
    </div>
    )
}

export default Subscreen;