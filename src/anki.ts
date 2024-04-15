import {
    fetchNotesInfo,
    findNotes,
    NoteId,
    NotesInfoItemField,
    NotesInfoItemFields,
    updateNoteFields,
    UpdateNoteFieldsFields,
    UpdateNoteFieldsNote,
} from './anki/api';
import { filterNoteContent, isSentence, splitMultiTerms } from './anki/note-text-filter';

export interface NoteFields extends NotesInfoItemFields {
    Simplified: NotesInfoItemField;
    Audio: NotesInfoItemField;
    Examples: NotesInfoItemField;
    Definitions: NotesInfoItemField;
    Image: NotesInfoItemField;
}

export interface NoteForProcessing {
    noteId: NoteId;
    text: string; // FrontText in Anki
}

export async function fetchNotesFromAnki(deckName: string): Promise<NoteForProcessing[]> {
    const notesIds = await findNotes(deckName);

    const notesInfo = await fetchNotesInfo<NoteFields>(notesIds);

    const notesWithoutExamples = notesInfo.filter((note) => note.fields.Examples.value.length === 0);

    const notesForProcessing = notesWithoutExamples.map((note): NoteForProcessing => {
        return {
            noteId: note.noteId,
            text: note.fields.Simplified.value,
        };
    });

    const filteredNotes = notesForProcessing.map((note) => {
        return {
            noteId: note.noteId,
            text: filterNoteContent(note.text),
        };
    });

    const notesNonSentences = filteredNotes.filter((note) => !isSentence(note.text));

    const notesSplittedMultipleTerms = splitMultiTerms(notesNonSentences);
    return notesSplittedMultipleTerms;
}

export interface UpdateNoteFields extends UpdateNoteFieldsFields {
    Examples: string;
}

export async function updateNote(noteData: UpdateNoteFieldsNote<UpdateNoteFields>): Promise<void> {
    await updateNoteFields(noteData);
}
