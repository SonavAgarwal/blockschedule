import { useState, useEffect } from "react";

import firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import firebaseConfig from "./firebaseConfig";

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.database();

export async function createBlock(name, index) {
    if (name === "") return;
    db.ref(`/users/${getUID()}/b`).push({
        n: name,
        i: index,
        t: 30,
    });
}

export async function updateBlockIndex(blockRef, newIndex) {
    blockRef.update({
        i: newIndex,
    });
}
export async function updateBlockTime(blockRef, newTime) {
    if (newTime === undefined) return;
    blockRef.update({
        t: newTime,
    });
}
export async function updateBlockName(blockRef, newName) {
    if (newName === undefined) return;
    blockRef.update({ n: newName });
}

export async function deleteBlock(blockRef) {
    blockRef.remove();
}

export function getUID() {
    if (!auth.currentUser) return null;
    return auth.currentUser.uid;
}

export function useUID() {
    const [user, loading, error] = useAuthState(auth);
    const [uid, setUID] = useState(null);

    useEffect(
        function () {
            const unsubscribe = auth.onAuthStateChanged(function (user) {
                if (user) {
                    setUID(user.uid);
                } else {
                    setUID(null);
                }
            });
            return () => {
                unsubscribe();
            };
        },
        [user, loading, error]
    );

    return uid;
}

export async function signIn() {
    let provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = credential.accessToken;
            // The signed-in user info.
            var user = result.user;
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
        });
}

export async function signOut() {
    auth.signOut();
}
