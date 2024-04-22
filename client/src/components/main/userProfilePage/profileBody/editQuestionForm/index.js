import React, { useState } from 'react';
import Form from "../../../baseComponents/form";
import Input from "../../../baseComponents/input";
import Textarea from "../../../baseComponents/textarea";
import {editQuestion} from "../../../../../services/questionService";

const EditQuestionForm = ({ question, onSave, onCancel }) => {
    const [title, setTitle] = useState(question.title);
    const [text, setText] = useState(question.text);
    const [tags, setTags] = useState(question.tags.map(tag => tag.name).join(' '));

    const [titleError, setTitleError] = useState('');
    const [textError, setTextError] = useState('');
    const [tagsError, setTagsError] = useState('');

    const validateInputs = () => {
        let isValid = true;
        setTitleError('');
        setTextError('');
        setTagsError('');

        if (!title) {
            setTitleError('Title cannot be empty');
            isValid = false;
        }
        if (!text) {
            setTextError('Text cannot be empty');
            isValid = false;
        }
        if (!tags) {
            setTagsError('Must have at least 1 tag');
            isValid = false;
        }
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateInputs()) {
            try {
                const tagsArray = tags.split(" ").filter(tag => tag.trim() !== "");
                const updatedQuestionData = {
                    title,
                    text,
                    tags: tagsArray
                };

                // Remove any empty fields to avoid overwriting with undefined
                Object.keys(updatedQuestionData).forEach(key => {
                    if (updatedQuestionData[key] === undefined) {
                        delete updatedQuestionData[key];
                    }
                });
                await editQuestion(question._id, updatedQuestionData);
                onSave(); // Use the onSave prop to handle the updated question in the parent component
            } catch (error) {
                console.error('Failed to save the question:', error);
            }
        }

    };


        return (
        <Form>
            <Input
                title={"Question Title"}
                hint={"Limit title to 100 characters or less"}
                id={"formTitleInput"}
                val={title}
                setState={setTitle}
                err={titleError}
            />
            <Textarea
                title={"Question Text"}
                hint={"Add details"}
                id={"formTextInput"}
                val={text}
                setState={setText}
                err={textError}
            />
            <Input
                title={"Tags"}
                hint={"Add keywords separated by whitespace"}
                id={"formTagInput"}
                val={tags}
                setState={setTags}
                err={tagsError}
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
                <div className="mandatory_indicator">
                    * indicates mandatory fields
                </div>
            </div>
        </Form>
    );
};

export default EditQuestionForm;
