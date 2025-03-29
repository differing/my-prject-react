/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const navigateFunc = useNavigate();
    const [user, setUser] = useState({});

    // 🧠 Зареждаме потребител от localStorage при стартиране
    useEffect(() => {
        const savedUser = localStorage.getItem('auth');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const onLogin = async (formData) => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        };

        const response = await fetch('http://localhost:3030/users/login', options);
        if (response.status === 403) {
            throw response;
        }

        const userData = await response.json();
        localStorage.setItem('auth', JSON.stringify(userData)); // 🆕 Записваме го
        setUser(userData);
        navigateFunc('/');
    };

    const onRegister = async (formData) => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const { repass, ...regData } = formData;
        if (repass !== regData.password) {
            throw new Error("Passwords don't match!");
        }

        options.body = JSON.stringify(regData);

        const response = await fetch('http://localhost:3030/users/register', options);
        if (response.status === 409) {
            throw response;
        }

        const userData = await response.json();
        const { _id, accessToken, email, username } = userData;
        const cleanUser = { _id, accessToken, email, username };

        localStorage.setItem('auth', JSON.stringify(cleanUser)); // 🆕 Записваме го
        setUser(cleanUser);
        navigateFunc('/');
    };

    const onLogout = async () => {
        const options = {
            method: 'GET',
            headers: { 'X-Authorization': user.accessToken },
        };

        try {
            await fetch('http://localhost:3030/users/logout', options);
        } catch (err) {
            console.warn("Logout request failed:", err.message);
        }

        localStorage.removeItem('auth'); // 🧼 Изчистваме
        setUser({});
        navigateFunc('/auth/login');
    };

    const authContext = {
        onLogin,
        onRegister,
        onLogout,
        user,
        hasUser: !!user.accessToken
    };

    return (
        <AuthContext.Provider value={authContext}>
            {children}
        </AuthContext.Provider>
    );
};

export {
    AuthContext,
    AuthProvider
};