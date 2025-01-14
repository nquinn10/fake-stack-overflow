// ************** THIS IS YOUR APP'S ENTRY POINT **************
import React from "react";
import "./stylesheets/App.css";
import FakeStackOverflow from "./components/fakestackoverflow.js";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <div>
            <ToastContainer />
            <FakeStackOverflow />
        </div>
    );
}

export default App;
