import React, { useState } from 'react';
import './index.css';
import Form from '../../main/baseComponents/form';
import Input from '../../main/baseComponents/input';
import Textarea from '../../main/baseComponents/textarea';
import { register } from '../../../services/userService';

const Register = ({ onRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [aboutMe, setAboutMe] = useState('');
    const [location, setLocation] = useState('');
    const [errors, setErrors] = useState({
                                             email: '',
                                             password: '',
                                             firstName: '',
                                             lastName: '',
                                             displayName: '',
                                             login: ''
                                         });

    const validateInputs = () => {
        let isValid = true;
        let newErrors = {...errors};
        if (!email) {
            newErrors.email = 'Email cannot be empty';
            isValid = false;
        }
        if (!password) {
            newErrors.password = 'Password cannot be empty';
            isValid = false;
        }
        if (!firstName) {
            newErrors.firstName = 'First name cannot be empty';
            isValid = false;
        }
        if (!lastName) {
            newErrors.lastName = 'Last name cannot be empty';
            isValid = false;
        }
        if (!displayName) {
            newErrors.displayName = 'Display name cannot be empty';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateInputs()) {
            const userData = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
                display_name: displayName,
                about_me: aboutMe,
                location: location
            };
            try {
                const result = await register(userData);
                if (result.message === 'User registered successfully') {
                    onRegister(result.display_name);
                }
            } catch (error) {
                let errorMessage = "An unexpected error occurred";  // Default error message
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            errorMessage = 'User already exists. Please log in.';
                            break;
                        case 500:
                            errorMessage = 'Server error, please try again later.';
                            break;
                    }
                }
                setErrors(prevErrors => ({ ...prevErrors, login: errorMessage }));
            }
        }
    };

    return (
        <Form>
            <Input
                title="Email"
                hint="Enter your email"
                id="email"
                val={email}
                setState={setEmail}
                err={errors.email} />
            <Input
                title="Password"
                hint="Create a password"
                id="password"
                val={password}
                setState={setPassword}
                err={errors.password} />
            <Input
                title="First Name"
                hint="Enter your first name"
                id="firstName"
                val={firstName}
                setState={setFirstName}
                err={errors.firstName} />
            <Input
                title="Last Name"
                hint="Enter your last name"
                id="lastName"
                val={lastName}
                setState={setLastName}
                err={errors.lastName} />
            <Input
                title="Display Name"
                hint="Choose a display name"
                id="displayName"
                val={displayName}
                setState={setDisplayName}
                err={errors.displayName} />
            <Textarea
                title="About Me"
                hint="Tell us about yourself"
                id="aboutMe"
                val={aboutMe}
                setState={setAboutMe} />
            <Input
                title="Location"
                hint="Where are you from?"
                id="location"
                val={location}
                setState={setLocation} />
            {errors.login && <div className="input_error">{errors.login}</div>}
            <button id={"registerButton"} onClick={handleSubmit}>Register</button>

        </Form>
    );
};

export default Register;
