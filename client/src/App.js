import Login from './pages/login';
import Home from './pages/home';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import Account from './pages/account';
import Settings from './pages/settings';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import RequiredAuth from './utils/requiredAuth';
import React from 'react';
import theme from './themeSetter';

function App() {
    // set theme on app load
    useEffect(() => {
        theme();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<RequiredAuth callbackURL = {'/login'}/>}>
                    <Route path="/" element={<Home />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
                    <Route element={<RequiredAuth callbackURL = {'/'}/>}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="*" element={<h1>404 Not Found</h1>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
    
}

export default App;
