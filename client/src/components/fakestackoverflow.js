import React from "react";
import { useState } from "react";
import Header from "./header";
import Main from "./main";
import { login } from "../services/userService";


export default function FakeStackOverflow() {
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [mainTitle, setMainTitle] = useState("All Questions");
    const [page, setPage] = useState("home");

    const setQuesitonPage = (search = "", title = "All Questions") => {
        setSearch(search);
        setMainTitle(title);
    };

    const handleLogin = async (email, password) => {
        try {
            const userData = await login(email, password);
            setUser(userData);
        } catch (error) {
            alert('Login failed: ' + error.message);
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
                    showLogin={handleShowLogin} // Pass functions to handle login and register
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
