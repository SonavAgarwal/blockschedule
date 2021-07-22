import React, { useEffect, useState } from "react";

import { useSwipeable } from "react-swipeable";
import { deleteBlock, updateBlockTime } from "../cloud/database";

import { FaPen, FaCheck, FaClock } from "react-icons/fa";

function Block(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [blockTime, setBlockTime] = useState(10);
    const [deleted, setDeleted] = useState(false);

    const handlers = useSwipeable({
        onSwipedLeft: openMenu,
        onSwipedRight: closeMenu,
    });

    useEffect(
        function () {
            setBlockTime(props.block.t);
        },
        [props.block]
    );

    function openMenu() {
        setMenuOpen(true);
    }

    function closeMenu() {
        setMenuOpen(false);
    }

    function updateTime() {
        updateBlockTime(props.blockRef, blockTime);
    }

    return (
        <div className={`blockSpace ${deleted ? "blockDeleted" : ""}`}>
            <div className='blockWrapper' style={{ transform: `rotate(${props.dragging ? "3deg" : "0deg"})` }}>
                <div
                    {...handlers}
                    onClick={function (e) {
                        if (e.currentTarget === e.target) {
                            closeMenu();
                        }
                    }}
                    className='block'>
                    <span className='roundSpan'>
                        {blockTime} <FaClock className='centeredIcon' alignmentBaseline='middle'></FaClock>
                    </span>
                    <div className='blockTextWrapper'>
                        <h2 className='blockText'>{props.block.n}</h2>
                    </div>
                    <button onClick={openMenu} className='editButton'>
                        <FaPen></FaPen>
                    </button>
                </div>
                <div className={`deleteBlock ${menuOpen ? "deleteBlockOpen" : "deleteBlockClosed"}`}>
                    <input
                        className='timeInput'
                        type='range'
                        min={5}
                        max={60}
                        value={blockTime}
                        onChange={(e) => {
                            setBlockTime(e.target.value);
                        }}
                        onMouseUp={function () {
                            console.log("done changing");
                            updateTime();
                        }}
                        onTouchEnd={function () {
                            console.log("done changing");
                            updateTime();
                        }}></input>
                    <button
                        onClick={function () {
                            setDeleted(true);
                            setTimeout(() => {
                                deleteBlock(props.blockRef);
                            }, 500);
                        }}
                        style={{ marginLeft: "0.5em" }}
                        className='editButton'>
                        <FaCheck></FaCheck>
                    </button>
                </div>
            </div>
            {/* <div className='block' style={{ backgroundColor: "red" }}>
                    Delete
                </div> */}
        </div>
    );
}

export default Block;
