import '../stylesheet/search.css';
import React, { useEffect } from 'react';
import AutoComplete from '../utils/autocomplete';

function SearchUser({users, placeholder, padding}) {
    const resetColor = (e) => {
        e.target.style.color = '';
        e.target.style.borderBottom = '';
    }

    useEffect(() => {
        //remove search results when component has no users
        document.getElementById('search-results').style.display = 'none';
    });
    
    return (
        <div className = "search-container">
            <div className = "search-content">
                <input
                    id="search-input"
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => {
                        AutoComplete(e.target.value, users);
                    }}
                    maxLength={75}
                    onFocus={resetColor}
                    style={{paddingLeft: padding}}
                />
                <div id="search-results"></div>
            </div>
        </div>
    )
}

export default SearchUser;