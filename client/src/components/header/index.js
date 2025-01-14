import "./index.css";
import { useState } from "react";
import {FaRegUser, FaSignInAlt, FaSignOutAlt, FaUserPlus} from "react-icons/fa";
import { FiFlag } from "react-icons/fi";


const Header = ({ search, setQuesitonPage, user, logout, showLogin, showRegister, showProfile, showPostMod }) => {
    const [val, setVal] = useState(search);

    const handleShowLogin = () => {
        showLogin();
    };

    const handleShowRegister = () => {
        showRegister();
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
                        <FaRegUser id={"userProfileButton"} className="icon" onClick={showProfile} />
                        <FiFlag className="icon" id={"postModerationButton"} onClick={handleShowPostMod} />
                        <FaSignOutAlt className="icon" id={"logoutButton"} onClick={logout} />
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
