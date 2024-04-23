import React, { useState } from 'react';
import {updateUserProfile} from "../../../services/userService";
import Form from "../baseComponents/form";
import Input from "../baseComponents/input";
import Textarea from "../baseComponents/textarea";

const EditProfileForm = ({profile, onSave, onCancel}) => {
    const [firstName, setFirstName] = useState(profile.first_name);
    const [lastName, setLastName] = useState(profile.last_name);
    const [displayName, setDisplayName] = useState(profile.display_name);
    const [aboutMe, setAboutMe] = useState(profile.about_me || '');
    const [location, setLocation] = useState(profile.location || '');
    const [errors, setErrors] = useState({
                                             firstName: '',
                                             lastName: '',
                                             displayName: '',
                                             save: ''
                                         });

    const validateInputs = () => {
        let isValid = true;
        let newErrors = {
            firstName: '',
            lastName: '',
            displayName: '',
            save: ''
        };
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateInputs()) {
            const userData = {
                first_name: firstName,
                last_name: lastName,
                display_name: displayName,
                about_me: aboutMe,
                location: location
            };
            try {
                await updateUserProfile(userData);
                onSave();
            } catch (error) {
                let errorMessage = "An unexpected error occurred";
                setErrors(prevErrors => ({ ...prevErrors, save: errorMessage }));
            }
        }
    };



    return (
        <Form>
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
                err={errors.displayName}/>
            <Textarea
                title="About Me"
                hint="Tell us about yourself"
                id="aboutMe"
                val={aboutMe}
                setState={setAboutMe}
                mandatory={false}/>
            <Input
                title="Location"
                hint="Where are you from?"
                id="location"
                val={location}
                setState={setLocation}
                mandatory={false}/>
            {errors.login && <div className="input_error">{errors.login}</div>}
            <div className="btn_indicator_container">
                <button
                    className="form_postBtn"
                    onClick={handleSubmit}
                >
                    Save
                </button>
                <button
                    className="form_postBtn"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>

        </Form>
    );
};

export default EditProfileForm;
