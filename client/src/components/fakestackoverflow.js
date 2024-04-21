import React from "react";
import { useState } from "react";
import Header from "./header";
import Main from "./main";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function FakeStackOverflow() {
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [mainTitle, setMainTitle] = useState("All Questions");
    const [page, setPage] = useState("home");

    const setQuesitonPage = (search = "", title = "All Questions") => {
        setSearch(search);
        setMainTitle(title);
    };

    const handleLogin = async (userData) => {
        if (userData) {
            setUser(userData);
            toast.success('Login successful!', { autoClose: 2000 });
            setPage('home');
        } else {
            // Display error message or handle invalid credentials
            alert('Login failed: Invalid email or password');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setPage("home"); // After logout, navigate to home page
    };

    const handleShowLogin = () => {
        setPage("login"); // Show login page
    };

    const handleShowRegister = () => {
        setPage("register"); // Show register page
    };


    return (
        <>
            <Header search={search}
                    setQuesitonPage={setQuesitonPage}
                    user={user}
                    logout={handleLogout}
                    showLogin={handleShowLogin}
                    showRegister={handleShowRegister}/>
                <Main
                    user={user}
                    search={search}
                    title={mainTitle}
                    setQuesitonPage={setQuesitonPage}
                    handleLogin={handleLogin}
                    page={page}
                    setPage={setPage}
                />
        </>
    );
}
