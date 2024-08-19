import axios from 'axios';
import './stylesheet/theme.css';

const theme = () => {
    //get the user theme
    axios.get('http://localhost:3000/api/theme/' + localStorage.getItem('username'))
        .then(response => {
            const {theme} = response.data;

            var root = document.documentElement;
            if (theme === "light") {
                root.style.setProperty('--background', '#f9f9f9');
                root.style.setProperty('--background-secondary', '#efefef');
                root.style.setProperty('--background-tertiary', '#dedede');
                root.style.setProperty('--background-hover', '#e0e0e0');
                root.style.setProperty('--background-hover-secondary', '#e9e9e9');
                root.style.setProperty('--border-standard', '#cacaca');
                root.style.setProperty('--icon-colour', '#5d5d5d');
                root.style.setProperty('--text-colour', '#5d5d5d');
                root.style.setProperty('--text-colour-secondary', '#7d7d7d');
                root.style.setProperty('--text-colour-tertiary', '#7d7d7d');
                root.style.setProperty('--text-colour-title', '#e6e6e6');
            }
        
            else if (theme === "dark") {
                root.style.setProperty('--background', '#1e1e1e');
                root.style.setProperty('--background-secondary', '#2c2c2c');
                root.style.setProperty('--background-tertiary', '#3a3a3a');
                root.style.setProperty('--background-hover', '#4a4a4a');
                root.style.setProperty('--background-hover-secondary', '#5a5a5a');
                root.style.setProperty('--border-standard', '#6a6a6a');
                root.style.setProperty('--icon-colour', '#d1d1d1');
                root.style.setProperty('--text-colour', '#d1d1d1');
                root.style.setProperty('--text-colour-secondary', '#b1b1b1');
                root.style.setProperty('--text-colour-tertiary', '#b1b1b1');
                root.style.setProperty('--text-colour-title', '#f1f1f1');
            }

            else {
                //system theme is automatically set when imported
            }
        })
        .catch(error => {
            console.error(error);
    });
}

export default theme;