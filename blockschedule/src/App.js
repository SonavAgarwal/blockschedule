import React, { useEffect } from "react";
import "./App.css";

import { BrowserRouter as Router, Switch, Route, Link, useHistory } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signOut } from "./cloud/database";
import SignIn from "./pages/SignIn";
import Blocks from "./pages/Blocks";

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
                        <Blocks />
                    </Route>
                    <Route path='/'>
                        <div>
                            <h1>at hoem</h1>
                        </div>
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

function AuthManager(props) {
    const [user, loading, error] = useAuthState(auth);
    const navigation = useHistory();

    useEffect(function () {
        if (!loading) {
            if (user) {
                console.log(navigation);
                navigation.push("/home");
            } else {
                navigation.push("/signin");
            }
        }
    });

    if (loading) {
        return (
            <div>
                <p>Initialising User...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className='navbar'>
            <div style={{ flex: 1 }}></div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "8vh", padding: "0vh 2vh" }}>
                <button className='button' onClick={signOut}>
                    Sign Out
                </button>
            </div>
            <div style={{ height: "8vh", aspectRatio: "1/1", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img src={user.photoURL} style={{ width: "6vh", height: "6vh", borderRadius: "100%" }}></img>
            </div>
        </div>
    );
}

export default App;
