import React, { useEffect, useRef, useState } from "react";
import { createBlock, db, deleteBlock, getUID, signOut, updateBlockIndex, updateBlockTime, useUID } from "../cloud/database";

import { useList, useListVals } from "react-firebase-hooks/database";
import Block from "../components/Block";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { FaCheck, FaPause, FaPlay } from "react-icons/fa";

import NoSleep from "nosleep.js";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

function Blocks(props) {
    const noSleep = useRef(new NoSleep());
    // const uid = useUID();
    const [values, loading, error] = useList(db.ref(`/users/${getUID()}/b`));
    const [blocks, setBlocks] = useState([]);

    const endDiv = useRef();

    const [blockName, setBlockName] = useState("");

    const [isPlaying, setIsPlaying] = useState(false);
    const [playingIndex, setPlayingIndex] = useState(0);

    useEffect(
        function () {
            console.log("the values have changed:");
            console.log(values);
            try {
                setBlocks([...values].sort((a, b) => a.val().i - b.val().i));
            } catch {}
        },
        [values]
    );

    useEffect(
        function () {
            let intervalID = setInterval(() => {
                console.log("interval run");
                handleTick();
            }, 60000);
            return () => {
                clearInterval(intervalID);
            };
        },
        [isPlaying, blocks, playingIndex]
    );

    function handleTick() {
        let playingIndexTemp = playingIndex;
        if (isPlaying) {
            if (blocks.length === 0) {
                setIsPlaying(false);
                noSleep.current.disable();
                return;
            }
            // let tryIndex = 0;
            while (true) {
                if (playingIndexTemp > blocks.length - 1) {
                    setIsPlaying(false);
                    setPlayingIndex(0);
                    return;
                }
                let block = blocks[playingIndexTemp];
                let newTime = block.val().t - 1;

                if (newTime < 0) {
                    playingIndexTemp += 1;
                    continue;
                } else {
                    updateBlockTime(block.ref, block.val().t - 1);
                    break;
                }
            }
            if (playingIndex !== playingIndexTemp) findPlaying();
            setPlayingIndex(playingIndexTemp);
        }
    }

    function onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(blocks, result.source.index, result.destination.index);

        items.forEach(function (item, index) {
            if (item.index != index) {
                updateBlockIndex(item.ref, index);
            }
        });

        setBlocks(items);
        if (result.source.index !== result.destination.index) {
            if (result.destination.index <= playingIndex) {
                setFirstPlayIndex();
            }
        }
    }

    function setFirstPlayIndex() {
        blocks.some(function (block, index) {
            if (block.val().t !== 0) {
                setPlayingIndex(index);
                return true;
            }
        });
    }

    function findPlaying() {
        setTimeout(() => {
            let playEl = document.getElementsByClassName("blockPlayingTag")[0];
            console.log("ayee");
            console.log(playEl);
            if (playEl) {
                playEl.scrollIntoView({ behavior: "smooth" });
            }
        }, 500);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        if (values.length < 15) {
            createBlock(blockName, values.length);
        }
        setBlockName("");

        window.setTimeout(function () {
            if (endDiv.current !== undefined) endDiv.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
        // endDiv.scrollIntoView({ behavior: "smooth" });
    }

    // console.log(values);
    if (loading) return <div></div>;
    if (!values) return <div></div>;
    if (error) return <div></div>;

    return (
        <>
            <div className='playContainer'>
                <button
                    className='playButton'
                    onClick={function () {
                        noSleep.current.enable();
                        setFirstPlayIndex();
                        setIsPlaying(!isPlaying);
                        findPlaying();
                    }}>
                    {isPlaying ? <FaPause></FaPause> : <FaPlay></FaPlay>}
                </button>
            </div>
            <div className='blocks'>
                <div style={{ flex: 1 }}></div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId='droppable'>
                        {(provided, snapshot) => {
                            return (
                                <div ref={provided.innerRef}>
                                    {blocks.map(function (b, index) {
                                        return (
                                            <Draggable key={b.key} draggableId={b.key} index={index}>
                                                {(provided, snapshot) => {
                                                    return (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <Block
                                                                dragging={snapshot.isDragging && !snapshot.isDropAnimating}
                                                                block={b.val()}
                                                                blockRef={b.ref}
                                                                top={index === 0}
                                                                playing={index === playingIndex && isPlaying}></Block>
                                                        </div>
                                                    );
                                                }}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            );
                        }}
                    </Droppable>
                </DragDropContext>
                <div ref={endDiv} style={{ height: 1, width: 1 }}></div>
            </div>
            <form
                className='blockInputForm'
                onSubmit={(e) => {
                    handleFormSubmit(e);
                }}>
                <input
                    className='blockInput'
                    placeholder={"Type a task..."}
                    value={blockName}
                    onChange={(e) => {
                        setBlockName(e.target.value);
                    }}></input>
                <button className='createButton' type='submit'>
                    {" "}
                    <FaCheck></FaCheck>
                </button>
            </form>
        </>
    );
}

export default Blocks;
