import '../stylesheet/search.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AutoComplete from '../utils/autocomplete';

function SearchUser() {
    const [users, setUsers] = useState([]);

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

    return (
        <div className = "search-container">
            <div className = "search-content">
                <input
                    id="search-input"
                    type="text"
                    placeholder="Search for user..."
                    onChange={(e) => {
                        AutoComplete(e.target.value, users);
                    }}
                />
            </div>
            <div id="search-results"></div>
        </div>
    )
}

export default SearchUser;