import React from "react";
import { useState } from "react";
import Header from "./header";
import Main from "./main";

export default function FakeStackOverflow() {
    const [search, setSearch] = useState("");
    const [mainTitle, setMainTitle] = useState("All Questions");

    const setQuesitonPage = (search = "", title = "All Questions") => {
        setSearch(search);
        setMainTitle(title);
    };
    return (
        <>
            <Header search={search} setQuesitonPage={setQuesitonPage} />
            <Main
                title={mainTitle}
                search={search}
                setQuesitonPage={setQuesitonPage}
            />
        </>
    );
}
