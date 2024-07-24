import Login from './pages/login';
import Home from './pages/home';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import { Route, Routes } from 'react-router-dom';
import RequiredAuth from './utils/requiredAuth';


function App() {
    return (
        <Routes>
            <Route element={<RequiredAuth/> }>
                <Route path="/home" element={<Home />} />
            </Route>
                
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
    );
    
}

export default App;
