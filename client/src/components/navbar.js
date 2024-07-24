import "../stylesheet/navbar.css";
import "../stylesheet/style.css";

export default function navbar() {

    const removeSession = () => {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const logoutUser = () => {
        localStorage.clear();
        removeSession();
        window.location.href = '/';
    }

    return (
        <div className = "navbar-container">
            <h2>Chatroom</h2>

            <button onClick={logoutUser}>
                logout
            </button>
            <div className = "navbar-profile">
                <img src = "https://www.w3schools.com/howto/img_avatar.png" alt = "Avatar"/>
            </div>
        </div>
    );
}
