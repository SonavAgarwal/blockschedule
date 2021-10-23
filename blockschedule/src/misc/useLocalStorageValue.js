import { useCallback, useEffect, useState } from "react";

export function useLocalStorageValue(key) {
    const [value, setValue] = useState(window.localStorage.getItem(key));

    useEffect(function () {
        let listener = window.addEventListener("storage", () => {
            // When local storage changes, dump the list to
            // the console.
            console.log("found a changeee");
            setValue(window.localStorage.getItem(key));
        });
        return function () {
            window.removeEventListener("storage", listener);
        };
    }, []);

    return value;
}
