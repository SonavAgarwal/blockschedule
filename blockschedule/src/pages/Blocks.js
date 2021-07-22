import React, { useEffect, useRef, useState } from "react";
import { createBlock, db, getUID, signOut, updateBlockIndex, useUID } from "../cloud/database";

import { useList, useListVals } from "react-firebase-hooks/database";
import Block from "../components/Block";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { FaCheck, FaPlay } from "react-icons/fa";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

function Blocks(props) {
    // const uid = useUID();
    const [values, loading, error] = useList(db.ref(`/users/${getUID()}/b`));
    console.log(values);
    const [blocks, setBlocks] = useState([]);

    const endDiv = useRef();

    const [blockName, setBlockName] = useState("");

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
    if (loading) return <div>loadign</div>;
    if (!values) return <div>loadignggg</div>;
    if (error) return <div>errro</div>;

    return (
        <>
            <div className='playContainer'>
                <button className='playButton'>
                    <FaPlay></FaPlay>
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
                                                                blockRef={b.ref}></Block>
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
