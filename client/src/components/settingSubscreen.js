import "../stylesheet/subscreen.css"
import "../stylesheet/style.css";
import { useEffect, useState } from 'react';
import SearchUser from '../components/searchUser';
import axios from 'axios';

function Subscreen({closeSubscreen, title, method}) {
    const [photo, setphoto] = useState('');
    const [blocked, setblocked] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        //fetch users
        axios.get('http://localhost:3000/api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

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

    const resetColour = (e) => {
        e.target.style.borderBottom = "";
        e.target.style.color = "";
        setError('');
    }

    const loadFile = () => {
        const file = document.getElementById('file-input').files[0];
        setphoto(URL.createObjectURL(file));

        axios.post('http://localhost:3000/api/profilepicture', {
            photo: URL.createObjectURL(file),
            username: localStorage.getItem('username')
        }).then(response => {
            console.log(response);
        }).then(error => {
            console.error(error);
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
            
        </div>
    </div>
    )
}

export default Subscreen;