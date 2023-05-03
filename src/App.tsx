import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import { NewNote } from "./NewNote";
import { useLocalStorage } from "./useLocalStorage";
import { useMemo } from "react";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "./NoteList";
import { NoteLayout } from "./NoteLayout";
import { Note } from "./Note";
import { EditNote } from "./EditNote";

export type Note = {
  id: string;
} & NoteData;

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};
//Each note should include an id, title, markdown, and tags.

export type RawNote = {
  id: string;
} & RawNoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};
//The difference between Note and RawNote is that RawNote uses tagIds instead of tags.
//The reason for creating RawNote is that when I make some changes on the label of a tag,
//I want to update the label of all notes that use that tag to the new one. If I use tags instead of tagIds,
//I would have to update the label of all notes that use that tag, which is not efficient.

export type Tag = {
  id: string;
  label: string;
};
//Each tag should include an id and label.

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);
  //useLocalStorage is a hook created by myself. It is used to store data in the browser's localstorage.

  const notesWithTags = useMemo(() => {
    return notes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      };
    }); // Convert RawNote to Note
  }, [notes, tags]);
  //Each time I update the notes or tags, I need to convert RawNote to Note.

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) }, //add a new RawNote to the notes array
      ];
    });
  }
  //This function is pass to the NewNote component as a prop.

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return { ...note, ...data, id, tagIds: tags.map((tag) => tag.id) };
        } else {
          return note;
        }
      });
    });
  }
  //Update the note with the specified id.

  function onDeleteNote(id: string) {
    setNotes((prevNotes) => {
      return prevNotes.filter((note) => note.id !== id);
    });
  }
  //Delete the note with the specified id.

  function onAddTag(tag: Tag) {
    setTags((prevTags) => [...prevTags, tag]);
  }

  function onUpdateTag(id: string, label: string) {
    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === id) {
          return { ...tag, label };
        } else {
          return tag;
        }
      });
    });
  }
  //When the label of a tag is updated,
  //update the label of all notes that use that tag to the new one.

  function onDeleteTag(id: string) {
    setTags((prevTags) => {
      return prevTags.filter((tag) => tag.id !== id);
    });
  }
  //Delete the tag with the specified id.

  return (
    <Container className="my-4">
      <Routes>
        <Route
          path="/"
          element={
            <NoteList
              notes={notesWithTags}
              availableTags={tags}
              onUpdateTag={onUpdateTag}
              onDeleteTag={onDeleteTag}
            />
          }
          //NoteList is a component created in src/NoteList.tsx. It is the main page of the app.
          //It contains the header, the search bar, and the cards of existing notes.
          //It take props notes, availableTags, onUpdateTag, and onDeleteTag.
        />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={onAddTag}
              availableTags={tags}
            />
          }
        />
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
          <Route index element={<Note onDeleteNote={onDeleteNote} />} />
          <Route
            path="edit"
            element={
              <EditNote
                onSubmit={onUpdateNote}
                onAddTag={onAddTag}
                availableTags={tags}
              />
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  );
}

export default App;
