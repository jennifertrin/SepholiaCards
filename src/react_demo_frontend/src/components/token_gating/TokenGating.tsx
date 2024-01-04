import React from "react";

interface NoteProps {
    setNote: React.Dispatch<React.SetStateAction<string>>;
}

const Note: React.FC<NoteProps> = ({ setNote }) => {
    return (
        <div className="w-full">
            <textarea
                className="w-full min-h-full resize border border-30 rounded-md p-4"
                placeholder="Add your note here"
                onChange={(event) => setNote(event.target.value)}
            />
        </div>
    );
};

export default Note;
