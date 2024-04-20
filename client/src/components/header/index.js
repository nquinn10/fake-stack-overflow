import "./index.css";
import { useState } from "react";
// import icons for postModeration (flag) and user (user)
import {FaRegUser, FaSignInAlt, FaSignOutAlt, FaUserPlus} from "react-icons/fa";
import { FiFlag } from "react-icons/fi";


const Header = ({ search, setQuesitonPage, user, logout, showLogin, showRegister, showPostMod }) => {
    const [val, setVal] = useState(search);

    const handleShowLogin = () => {
        showLogin(); // Call the function passed from FakeStackOverflow
    };

    const handleShowRegister = () => {
        showRegister(); // Call the function passed from FakeStackOverflow
    };

    const handleShowPostMod = () => {
        showPostMod();
    };

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
                {user ? (
                    <>
                        <FaRegUser className="icon" />
                        <FiFlag className="icon" onClick={handleShowPostMod} />
                        <FaSignOutAlt className="icon" onClick={logout} />
                    </>
                ) : (
                     <div className="auth-buttons">
                         <button onClick={handleShowLogin}>
                             <FaSignInAlt className="icon" />
                             Login
                         </button>
                         <button onClick={handleShowRegister}>
                             <FaUserPlus className="icon" />
                             Register
                         </button>
                     </div>
                 )}
            </div>
        </div>
    );

};

export default Header;
