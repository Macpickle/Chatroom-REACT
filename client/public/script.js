import axios from 'axios';
console.log('script.js loaded');
//get theme of user
axios.get('http://localhost:3000/api/theme/' + localStorage.getItem('username'))
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error(error);
});