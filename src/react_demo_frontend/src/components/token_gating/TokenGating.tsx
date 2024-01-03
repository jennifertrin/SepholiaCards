import { useState } from "react";
import { token_gating } from "../../../../declarations/token_gating";
import { useIdentity } from "../../ic/useIdentity";

export default function Note() {
    const [note, setNote] = useState<string>("");
    const { identity } = useIdentity();

    async function addTokenGatedNote(text: string) {
        if (!identity?.getPrincipal()) return null;
        const noteInfo = await token_gating.create_note();
        const noteId = BigInt(noteInfo);
        await token_gating.update_note(noteId, text);
        await token_gating.add_user(noteId, identity?.getPrincipal().toString());
    }

    return (
        <div className="flex flex-col w-full gap-4">
            <textarea className="w-full min-h-full resize border border-30 rounded-md p-4" onChange={(event) => setNote(event.target.value)} ></textarea>
            <button onClick={async () => await addTokenGatedNote(note)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-48 mx-auto rounded">
                Save Message
            </button>
        </div>
    )
}
