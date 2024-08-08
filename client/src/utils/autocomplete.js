function AutoComplete(input, users) {
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
    for (var j = 0; j < users.length; j++) {
        if (users[j].members[0].username.toLowerCase().indexOf(searchUser) === -1) {
            continue;
        }
        var result = document.createElement('div');
        result.className = 'search-result';
        result.innerHTML = `
            <img src=${users[j].members[0].photo} alt="Avatar" />
            <h3>${boldSearchText(users[j].members[0].username, searchUser)}</h3>
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