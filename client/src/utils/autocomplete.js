function AutoComplete(input, users) {
    var usersFormatted = [];

    if (users[0].members) {
        for (let i = 0; i < users.length; i++ ) {
            usersFormatted.push(users[i].members[0]);
        }
    } else {
        usersFormatted = users
    }

    if (input && input !== '') {
        document.getElementById('search-results').style.display = 'flex';
    } else {
        document.getElementById('search-results').style.display = 'none';
    }
    var searchUser = input.toLowerCase();

    //bold search text if found
    function boldSearchText(username, searchUser) {
        var regex = new RegExp(searchUser, 'gi');
        return username.replace(regex, '<strong>$&</strong>');
    }
    
    var searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    for (var j = 0; j < usersFormatted.length; j++) {
        if (usersFormatted[j].username.toLowerCase().indexOf(searchUser) === -1) {
            continue;
        }
        var result = document.createElement('div');
        result.className = 'search-result';
        result.innerHTML = `
            <img src=${usersFormatted[j].photo} alt="Avatar" />
            <h3>${boldSearchText(usersFormatted[j].username, searchUser)}</h3>
        `;
        searchResults.appendChild(result);
    }

    searchResults.addEventListener('click', function(event) {
        var clickedResult = event.target.closest('.search-result');
        if (clickedResult) {
            document.getElementById('search-input').value = clickedResult.querySelector('h3').textContent;
            document.getElementById('search-results').style.display = 'none';
        }
    });
}

export default AutoComplete;