import React, { useEffect, useRef, useState } from "react";

import { useSwipeable } from "react-swipeable";
import { deleteBlock, updateBlockName, updateBlockTime } from "../cloud/database";

import { debounce } from "debounce";

import { FaPen, FaCheck, FaClock } from "react-icons/fa";
import tagKeywords from "./tagKeywords";

const encoder = new TextEncoder();

function useForceUpdate() {
    const [value, setValue] = useState(0); // integer state
    return () => setValue((value) => value + 1); // update the state to force render
}

function Block(props) {
    const forceUpdate = useForceUpdate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [blockTime, setBlockTime] = useState(10);
    const [blockName, setBlockName] = useState(props.block.n);
    const [blockTags, setBlockTags] = useState([]);
    const [deleted, setDeleted] = useState(false);

    const inputRef = useRef();

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

    useEffect(
        function () {
            let splitText = props.block.n.split(" ");
            let tagText = [];
            let nameText = [];
            splitText.forEach(function (word, index) {
                if (word.charAt(0) === "!") {
                    tagText.push(word.substring(1));
                } else {
                    nameText.push(word);
                }
            });

            async function updateTags(tagText) {
                let tagObjects = [];

                for (const tag of tagText) {
                    const lowerTag = tag.toString().toLowerCase();
                    let digest = await window.crypto.subtle.digest("SHA-1", encoder.encode(lowerTag)); // hash the message
                    let hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
                    let hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
                    let color = "#" + hashHex.substring(0, 6);

                    for (const kw of tagKeywords) {
                        if (lowerTag.includes(kw.word)) {
                            color = kw.color;
                        }
                    }
                    tagObjects.push({ text: tag, color: color });
                }

                setBlockTags(tagObjects);
                forceUpdate();
            }

            updateTags(tagText);

            let joinedText = nameText.join(" ");
            inputRef.current.value = joinedText;
            setBlockName(joinedText);
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

    function handleTagClick(event, tagObj) {
        if (event.detail === 3) {
            let filteredBlockTags = [...blockTags].filter((bT) => bT !== tagObj);
            setBlockTags(filteredBlockTags);
            setBlockTags(filteredBlockTags);
            setTimeout(() => {
                setBlockTags(filteredBlockTags);
                forceUpdate();
            }, 1000);
            updateAllBlockName(blockName, filteredBlockTags);
        }
    }

    function updateTime() {
        updateBlockTime(props.blockRef, blockTime);
    }

    async function updateAllBlockName(newName, newTags) {
        let tagStrings = newTags.map((tag) => {
            return "!" + tag.text;
        });
        let completeString = tagStrings.join(" ") + " " + newName;
        await updateBlockName(props.blockRef, completeString);
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
                    <div className='blockTags'>
                        {blockTags.map((tagObject) => {
                            return (
                                <span
                                    onClick={(event) => {
                                        handleTagClick(event, tagObject);
                                    }}
                                    className='roundSpan'
                                    style={{ backgroundColor: tagObject.color }}>
                                    {tagObject.text}
                                </span>
                            );
                        })}
                    </div>
                    <div className='blockTextWrapper'>
                        <input
                            ref={inputRef}
                            onChange={debounce(function (event) {
                                event.target.classList.add("pulse");
                                updateAllBlockName(event.target.value, blockTags);

                                setTimeout(() => {
                                    event.target.classList.remove("pulse");
                                }, 300);
                            }, 800)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className='blockText'
                            defaultValue={blockName}></input>
                    </div>
                    <button onClick={openMenu} className='editButton'>
                        <FaPen></FaPen>
                    </button>
                </div>
                <div tabIndex={-1} className={`deleteBlock ${menuOpen ? "deleteBlockOpen" : "deleteBlockClosed"}`}>
                    <input
                        tabIndex={-1}
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
                        tabIndex={-1}
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
