import React, { useState } from 'react';
import Form from '../../main/baseComponents/form';
import Input from '../../main/baseComponents/input';
import './index.css';
import { login } from '../../../services/userService';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loginError, setLoginError] = useState('');

    const validateInputs = () => {
        let isValid = true;
        if (!email) {
            setEmailError('Email cannot be empty');
            isValid = false;
        }
        if (!password) {
            setPasswordError('Password cannot be empty');
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateInputs()) {
            try {
                const userData = await login(email, password); // Call the login service
                if (userData) {
                    onLogin(userData); // Pass user data to the parent component
                } else {
                    setLoginError('Invalid email or password'); // Set login error message
                }
            } catch (error) {
                setLoginError('An error occurred during login'); // Set generic error message
            }
        }
    };

    return (
        <Form>
            <Input
                title="Email"
                val={email}
                setState={setEmail}
                err={emailError}
            />
            <Input
                title="Password"
                val={password}
                setState={setPassword}
                type="password"
                err={passwordError}
            />
            {loginError && <div className="input_error">{loginError}</div>}
            <button onClick={handleSubmit}>Login</button>
        </Form>
    );
};

export default Login;
