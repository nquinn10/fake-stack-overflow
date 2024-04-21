import React, { useState } from 'react';
import Form from "../../../baseComponents/form";
import Input from "../../../baseComponents/input";
import Textarea from "../../../baseComponents/textarea";
import {editQuestion} from "../../../../../services/questionService";

const EditQuestionForm = ({ question, onSave, onCancel }) => {
    const [title, setTitle] = useState(question.title);
    const [text, setText] = useState(question.text);
    const [tags, setTags] = useState(question.tags.map(tag => tag.name).join(' '));

    const handleSubmit = async (e) => {
        e.preventDefault();

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

        try {
            await editQuestion(question._id, updatedQuestionData);
            onSave(); // Use the onSave prop to handle the updated question in the parent component
        } catch (error) {
            // Handle errors such as displaying error messages
            console.error('Failed to save the question:', error);
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
                //err={titleErr}
            />
            <Textarea
                title={"Question Text"}
                hint={"Add details"}
                id={"formTextInput"}
                val={text}
                setState={setText}
                //err={textErr}
            />
            <Input
                title={"Tags"}
                hint={"Add keywords separated by whitespace"}
                id={"formTagInput"}
                val={tags}
                setState={setTags}
                //err={tagErr}
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
