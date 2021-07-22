import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../cloud/database";

function UserLoader(props) {
    const [user, loading, error] = useAuthState(auth);
    if (loading) return null;
    if (!user) return null;
    console.log("heree");
    console.log(user);
    return <>{props.children}</>;
}

export default UserLoader;
