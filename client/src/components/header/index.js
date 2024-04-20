import "./index.css";
import { useState } from "react";
// import icons for postModeration (flag) and user (user)
import { FaRegUser } from "react-icons/fa";
import { FiFlag } from "react-icons/fi";


const Header = ({ search, setQuesitonPage }) => {
    const [val, setVal] = useState(search);

    return (
        <div id="header" className="header">
            <div className="title">Fake Stack Overflow</div>
            <input
                id="searchBar"
                placeholder="Search ..."
                type="text"
                value={val}
                onChange={(e) => {
                    setVal(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        setQuesitonPage(e.target.value, "Search Results");
                    }
                }}
            />
            <div className="icons">
                <FaRegUser className="icon" />
                <FiFlag className="icon" />

            </div>
        </div>
    );
};

export default Header;
