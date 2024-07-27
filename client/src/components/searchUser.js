import '../stylesheet/search.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AutoComplete from '../utils/autocomplete';

function SearchUser({users, placeholder}) {
    const resetColor = (e) => {
        e.target.style.color = '';
        e.target.style.borderBottom = '';
        if (document.getElementById('search-results')) {
            document.getElementById('search-results').innerHTML = '';
        }
    }

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
                />
                <div id="search-results"></div>
            </div>
        </div>
    )
}

export default SearchUser;