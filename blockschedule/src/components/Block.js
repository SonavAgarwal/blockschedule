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

    function toggleMenu() {
        setMenuOpen(!menuOpen);
    }

    function updateTime() {
        updateBlockTime(props.blockRef, blockTime);
    }

    return (
        <div
            className={`blockSpace ${deleted ? "blockDeleted" : ""} ${props.block.t === 0 ? "blockFinished" : ""} ${props.top ? "blockTop" : ""} ${
                props.playing ? "blockPlayingTag" : ""
            }`}>
            <div
                className='blockWrapper'
                style={{ transform: `rotate(${props.dragging ? "3deg" : "0deg"})` }}
                onClick={function (e) {
                    if (e.currentTarget === e.target) {
                        closeMenu();
                    }
                }}>
                <div
                    {...handlers}
                    onClick={function (e) {
                        if (e.currentTarget === e.target) {
                            closeMenu();
                        }
                    }}
                    className={`block ${props.playing ? "blockPlaying" : ""}`}>
                    <span onClick={toggleMenu} className='roundSpan'>
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
                            updateTime();
                        }}
                        onTouchEnd={function () {
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
