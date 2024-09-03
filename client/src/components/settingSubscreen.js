import "../stylesheet/subscreen.css"
import "../stylesheet/style.css";
import { useEffect, useState } from 'react';
import SearchUser from '../components/searchUser';
import axios from 'axios';

function Subscreen({closeSubscreen, title, method}) {
    // the subscreen options and functionality
    const [photo, setphoto] = useState('');
    const [blocked, setblocked] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        // fetch users, allows for searching
        axios.get('http://localhost:3000/api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    // if the subscreen setting is "Photo", change params based on the option
    useEffect(() => {
        if (method === "Photo") {
            axios.get('http://localhost:3000/api/profilepicture/' + localStorage.getItem('username'))
                .then(response => {
                    const profilePic = response.data.photo;
                    setphoto(profilePic);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }); 

    // if the subscreen setting is "Blocked", change params based on the option
    useEffect(() => {
        if (method === "Blocked") {
            axios.get('http://localhost:3000/api/blocked/' + localStorage.getItem('username'))
                .then(response => {
                    const blocked = response.data.blocked;
                    setblocked(blocked);
                })
                .catch(error => {
                    console.error(error);
            });
        }
    }, [method])

    // for the blocked functionallity, finds if current user has a person blocked and displays it in the blocked array.
    // allows for user to change from state of blocked to unblocked.
    function blockUser(e, value) {
        let otherUser = "";
        if (!value) {
            otherUser = e.target.value;
        } else {
            otherUser = value;
        }

        axios.post('http://localhost:3000/api/block/', {
            blockUser: otherUser,
            currentUser: localStorage.getItem('username')
        }).then(response => {
            setblocked(response.data.blocked);
        })
        .catch(error => {
            // create an error message event
            const { message } = error.response.data;
            setError(message);

            if (message === 'Fields must be filled!') {
                document.getElementById('search-input').style.borderBottom = '1px solid red';
                document.getElementById('search-input').placeholder = 'User not found';
            }

            if (message === 'User not found!') {
                document.getElementById('search-input').style.borderBottom = '1px solid red';
                document.getElementById('search-input').style.color = 'red';
            }

        });
    }

    // allows functionallity to the blocked menu, switches blocked state if clicked.
    useEffect(() => {
        if (method === "Blocked") {
            const handleKeyDown = (e) => {
                if (e.key === 'Enter') {
                    blockUser(e);
                }
            };

            const handleClick = (e) => {
                blockUser(e, e.target.value);
            };

            document.getElementById('search-input').addEventListener('keydown', handleKeyDown);
            document.getElementById('search-results').addEventListener('click', handleClick);

            return () => {
                if (document.getElementById('search-input')) {
                    document.getElementById('search-input').removeEventListener('keydown', handleKeyDown);
                    document.getElementById('search-results').removeEventListener('click', handleClick);
                }
            };
        }
    }, [method]);

    // resets colour if error exists, and is changed.
    const resetColour = (e) => {
        e.target.style.borderBottom = "";
        e.target.style.color = "";
        setError('');
    }

    // loads file submitted for photo changes, not working cause imgur hates me
    const loadFile = async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('https://api.imgur.com/3/image', formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": "Client-ID " + process.env.IMGUR_CLIENT_ID,
            }
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.error(error);
        });
        
    }

    // for deleting a user, checks if the password value is equal to the current user's password
    // if the same, will delete user from database
    const deleteUser = () => {
        axios.post('http://localhost:3000/api/delete', {
            username: localStorage.getItem('username'),
            password: document.getElementById('confirm').value
        }).then(response => {
            localStorage.clear();
            window.location.reload();
        }).catch(error => {
            // create an error message event
            const { message } = error.response.data;
            setError(message);

            document.getElementById('confirm').style.borderBottom = '1px solid red';
            document.getElementById('confirm').placeholder = 'Password required';
        });
    }

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
    
            <div className="error">
                <p>{error}</p>
            </div>

            {method === "Photo" ? (
            <div className = "subscreen-photo-container">
                <div className = "subscreen-photo">
                    <img src={photo} alt = "profile"/>
                </div>
                <input type = "file" id = "file-input" onChange={loadFile}/>
                <label htmlFor="file-input">Select file</label>
            </div>
            ) : (
                <div></div>
            )}
            {method === "Blocked" ? (
            <div className = "subscreen-blocked-container">
                <div className = "search-user" onChange={resetColour}>
                    <SearchUser users={users} placeholder="Block a user..." padding = {null}/>
                </div>
                <div className = "subscreen-blocked">
                    {blocked.map((user, index) => {
                        return (
                            <div className = "tooltip" key = {index}>
                                <button className = "user-button" onClick = {() => blockUser(0, user.username)}>
                                    <img src={user.photo} alt = "profile"/>
                                    <h1>{user.username}</h1>
                                    <div className = "unblock">
                                        <p>Unblock</p>
                                    </div>
                                </button>
                                <span className="tooltiptext">Unblock</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            ) : (
                <div></div>
            )}

            {method === "Delete" ? (
                <div className = "subscreen-delete-container">
                    <div className = "subscreen-delete">
                        <h3>Are you sure you want to delete your account?</h3>
                        
                        <div className = "subscreen-confirm">
                            <input id = "confirm" type = "text" placeholder = "Confirm with your password..." onChange={resetColour}/>
                            <button className = "confirm-button" onClick = {deleteUser}>Confirm</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
            
            
        </div>
    </div>
    )
}

export default Subscreen;