import React from "react";
import { useState } from "react";
import Header from "./header";
import Main from "./main";
import Login from "./auth/login/index";
import Register from "./auth/register/index";


export default function FakeStackOverflow() {
    const [user, setUser] = useState(null);
    const [page, setPage] = useState("home");
    const [search, setSearch] = useState("");
    const [mainTitle, setMainTitle] = useState("All Questions");

    const setQuesitonPage = (search = "", title = "All Questions") => {
        setSearch(search);
        setMainTitle(title);
    };

    const handleLogin = userDetails => {
        setUser(userDetails);
        setPage("home");
    };

    const handleLogout = () => {
        setUser(null);
        setPage("home");
    };

    const showLogin = () => setPage("login");
    const showRegister = () => setPage("register");

    return (
        <>
            <Header search={search} setQuesitonPage={setQuesitonPage} showLogin={showLogin} showRegister={showRegister} user={user} logout={handleLogout} />
            {page === "login" && <Login onLoginSuccess={handleLogin} />}
            {page === "register" && <Register onRegisterSuccess={handleLogin} />}
            {["home", "profile", "other"].includes(page) && (
                <Main
                    title={mainTitle}
                    search={search}
                    setQuesitonPage={setQuesitonPage}
                    user={user}
                    page={page}
                />
            )}
        </>
    );
}
