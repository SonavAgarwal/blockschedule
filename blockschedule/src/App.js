import React, { useEffect } from "react";
import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link, useHistory } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signOut } from "./cloud/database";
import SignIn from "./pages/SignIn";
import Blocks from "./pages/Blocks";
import UserLoader from "./components/UserLoader";
import { FaRegCaretSquareDown, FaRegCaretSquareUp } from "react-icons/fa";
import { useLocalStorageValue } from "./misc/useLocalStorageValue";

function App() {
    return (
        <>
            <Router>
                <AuthManager></AuthManager>
                <Switch>
                    <Route path='/signin'>
                        <SignIn />
                    </Route>
                    <Route path='/home'>
                        <UserLoader>
                            <Blocks />
                        </UserLoader>
                    </Route>
                    <Route path='/'>
                        <div>{/* <h1>at hoem</h1> */}</div>
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

function AuthManager(props) {
    const [user, loading, error] = useAuthState(auth);
    const navigation = useHistory();

    const expandBlocks = useLocalStorageValue("expandBlocks");

    useEffect(function () {
        if (!loading) {
            if (user) {
                navigation.push("/home");
            } else {
                navigation.push("/signin");
            }
        }
    });

    if (loading) {
        return null;
    }

    if (!user) {
        return null;
    }

    return (
        <div className='navbar'>
            <div style={{ flex: 1, alignItems: "center", paddingLeft: "1rem", display: "flex", height: "100%" }}>
                <h1 style={{ margin: 0, marginLeft: "0.5rem", whiteSpace: "nowrap", fontSize: "1.25rem" }}>{user.displayName}</h1>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "0 0rem", paddingLeft: "1rem" }}>
                <button
                    className='button'
                    style={{ display: "flex", alignItems: "center" }}
                    onClick={function () {
                        if (expandBlocks === "true") window.localStorage.setItem("expandBlocks", "false");
                        else window.localStorage.setItem("expandBlocks", "true");

                        window.dispatchEvent(new Event("storage"));

                        console.log("ey");
                        console.log(expandBlocks);
                    }}>
                    {
                        <FaRegCaretSquareDown
                            className='transitionIcon'
                            style={{ transform: expandBlocks === "true" ? "rotateZ(0deg)" : "rotateZ(-180deg)" }}></FaRegCaretSquareDown>
                    }
                </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "0 0rem", paddingLeft: "1rem" }}>
                <button className='button' onClick={signOut}>
                    Sign Out
                </button>
            </div>
            <div style={{ height: "100%", aspectRatio: "1/1", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img src={user.photoURL} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "100%" }}></img>
            </div>
        </div>
    );
}

export default App;
