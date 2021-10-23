import React, { useEffect, useRef, useState } from "react";

import { useSwipeable } from "react-swipeable";
import { deleteBlock, updateBlockName, updateBlockTime } from "../cloud/database";

import { debounce } from "debounce";

import { FaPen, FaCheck, FaClock } from "react-icons/fa";
import tagKeywords, { linkKeywords } from "./tagKeywords";
import DivideBar from "./DivideBar";
import { useLocalStorageValue } from "../misc/useLocalStorageValue";

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

    const expandBlocks = useLocalStorageValue("expandBlocks");

    useEffect(
        function () {
            setBlockTime(props.block.t);
        },
        [props.block]
    );

    useEffect(
        function () {
            if (props.block.n === "~DIVIDEBAR~") return;
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

                    let isLink = false;
                    for (const kw of linkKeywords) {
                        if (tag.includes(kw)) {
                            isLink = true;
                        }
                    }

                    let tagText = tag;
                    if (isLink && !tagText.includes("http")) tagText = "//" + tag;

                    if (isLink) {
                        tagObjects.push({ text: tagText, color: color, link: true });
                    } else {
                        tagObjects.push({ text: tagText, color: color, link: false });
                    }
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

    // https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
    function pickTextColorBasedOnBgColorSimple(bgColor) {
        var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
        var r = parseInt(color.substring(0, 2), 16); // hexToR
        var g = parseInt(color.substring(2, 4), 16); // hexToG
        var b = parseInt(color.substring(4, 6), 16); // hexToB
        let resp = r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black" : "white";
        return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black" : "white";
    }

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

    if (props.block.n === "~DIVIDEBAR~") return <DivideBar></DivideBar>;
    return (
        <div
            className={`blockSpace ${deleted ? "blockDeleted" : ""} ${props.block.t === 0 ? "blockFinished" : ""} ${props.top ? "blockTop" : ""} ${
                props.playing ? "blockPlayingTag" : ""
            }`}>
            <div
                className='blockWrapper'
                style={{
                    transform: `rotate(${props.dragging ? "3deg" : "0deg"})`,
                }}
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
                    style={{
                        backgroundColor: "red !important",
                        ...(expandBlocks === "true" && { height: (props.block.t / 100) * 10 + 4 + "rem" }),
                    }}
                    className={`block ${props.playing ? "blockPlaying" : ""}`}>
                    <span onClick={toggleMenu} className='roundSpan'>
                        {blockTime} <FaClock className='centeredIcon' alignmentBaseline='middle'></FaClock>
                    </span>
                    <div className='blockTags'>
                        {blockTags.map((tagObject) => {
                            if (tagObject.link) {
                                return (
                                    <span
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(event) => {
                                            handleTagClick(event, tagObject);
                                        }}
                                        className='roundSpan'
                                        style={{
                                            backgroundColor: tagObject.color,
                                        }}>
                                        <a className='tagLink' target='_blank' href={tagObject.text}>
                                            Link
                                        </a>
                                    </span>
                                );
                            }
                            return (
                                <span
                                    onClick={(event) => {
                                        handleTagClick(event, tagObject);
                                    }}
                                    className='roundSpan'
                                    style={{
                                        backgroundColor: tagObject.color,
                                        color: pickTextColorBasedOnBgColorSimple(tagObject.color),
                                    }}>
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
