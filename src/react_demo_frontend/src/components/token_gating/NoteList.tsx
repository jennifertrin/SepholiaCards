import { useEffect, useState } from "react";
import { token_gating } from "../../../../declarations/token_gating";
import { useIdentity } from "../../ic/useIdentity";
import { EncryptedNote } from "../../../../declarations/token_gating/token_gating.did";

export default function Note() {
    const [notes, setNotes] = useState<EncryptedNote[] | []>([]);
    const { identity } = useIdentity();

    useEffect(() => {
        async function getNotes() {
            try {
                const notes = await token_gating.get_notes();
                setNotes(notes);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        }

        getNotes();
    }, [identity]);

    return (
        <div className="flex flex-col w-full gap-4">
            {notes.map((note) => {
                return <div key={note.id}>{note.encrypted_text}</div>;
            })}
        </div>
    );
}
