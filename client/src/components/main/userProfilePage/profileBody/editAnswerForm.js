import React, { useState } from 'react';
import Form from "../../baseComponents/form";
import Textarea from "../../baseComponents/textarea";
import {editAnswer} from "../../../../services/answerService";

const EditAnswerForm = ({ answer, onSave, onCancel }) => {
    const [text, setText] = useState(answer.text);

    const handleSubmit = async (e) => {
        e.preventDefault();;
        try {
            await editAnswer(answer._id, { text });
            onSave(); // Use the onSave prop to handle the updated question in the parent component
        } catch (error) {
            // Handle errors such as displaying error messages
            console.error('Failed to save the question:', error);
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