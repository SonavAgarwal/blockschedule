import React from "react";
import { signIn, signOut } from "../cloud/database";
import GoogleButton from "react-google-button";

import logo from "../BlockScheduleLogo.png";

function SignIn(props) {
    return (
        <div style={{ padding: "2em", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "3em 0em" }}>
                <img src={logo} style={{ width: "7rem", height: "7rem", border: "2px solid gray", borderRadius: "100%" }}></img>
            </div>
            <h1 style={{ marginTop: 0, textAlign: "center" }}>Sign In to BlockSchedule</h1>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <GoogleButton onClick={signIn} />
            </div>
        </div>
    );
}

export default SignIn;
