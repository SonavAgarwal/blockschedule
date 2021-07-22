import React, { useState } from "react";

import { useSwipeable } from "react-swipeable";
import { deleteBlock } from "../cloud/database";

function Block(props) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handlers = useSwipeable({
        onSwiped: (eventData) => console.log("User Swiped!", eventData),
        onSwipedLeft: openMenu,
        onSwipedRight: closeMenu,
    });

    function openMenu() {
        setMenuOpen(true);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <div {...handlers} className='blockSpace'>
            <div className='block' style={{}}>
                <h2 style={{ flex: 1 }}>{props.block.n}</h2>
                <div style={{ maxWidth: menuOpen ? "30vw" : "0px" }} className='deleteBlock'>
                    <p>trash</p>
                </div>
            </div>
            {/* <div className='block' style={{ backgroundColor: "red" }}>
                    Delete
                </div> */}
        </div>
    );
}

export default Block;
