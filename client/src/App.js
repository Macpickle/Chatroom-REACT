import Login from './pages/login';
import Home from './pages/home';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';

// retrieve from server, check if user is logged in/has a session
const isAuthenticated = false;

function App() {
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<Login />} />
            </Routes>
        );
    } else {
        return <Home />;
    }
}

export default App;
