import React, { useState } from 'react';
import Form from "../../baseComponents/form";
import Textarea from "../../baseComponents/textarea";
import {editAnswer} from "../../../../services/answerService";

const EditAnswerForm = ({ answer, onSave, onCancel }) => {
    const [text, setText] = useState(answer.text);
    const [textError, setTextError] = useState('');

    const validateInputs = () => {
        let isValid = true;
        setTextError('');

        if (!text) {
            setTextError('Answer text cannot be empty');
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateInputs()) {
            try {
                await editAnswer(answer._id, { text });
                onSave();
            } catch (error) {
                console.error('Failed to save the question:', error);
            }
        }
    };

    return (
        <Form>
            <Textarea
                title={"Answer Text"}
                hint={"Add details"}
                id={"formTextInput"}
                val={text}
                setState={setText}
                err={textError}
            />
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

export default EditAnswerForm;