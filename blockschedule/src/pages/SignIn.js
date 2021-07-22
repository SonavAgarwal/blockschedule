import React from "react";
import { signIn, signOut } from "../cloud/database";
import GoogleButton from "react-google-button";

function SignIn(props) {
    return (
        <div style={{ padding: "2em", boxSizing: "border-box" }}>
            <h1 style={{ marginTop: 0, textAlign: "center" }}>Sign In</h1>
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <GoogleButton onClick={signIn} />
            </div>
        </div>
    );
}

export default SignIn;
