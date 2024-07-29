function AutoComplete(input, users) {
    if (input && input !== '') {
        document.getElementById('search-results').style.display = 'flex';
    } else {
        document.getElementById('search-results').style.display = 'none';
    }
    var searchUser = input.toLowerCase();
    var userArray = [];

    if (users) {
        for (var i = 0; i < users.users.length; i++) {
            if (users.users[i].username && users.users[i].username.toLowerCase().includes(searchUser)) {
                userArray.push(users.users[i]);
            }
        }
    }

    //bold search text if found
    function boldSearchText(username, searchUser) {
        var regex = new RegExp(searchUser, 'gi');
        return username.replace(regex, '<strong>$&</strong>');
    }
    
    var searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    for (var j = 0; j < userArray.length; j++) {
        var result = document.createElement('div');
        result.className = 'search-result';
        result.innerHTML = `
            <img src=${userArray[j].photo} alt="Avatar" />
            <h3>${boldSearchText(userArray[j].username, searchUser)}</h3>
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