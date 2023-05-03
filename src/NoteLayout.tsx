import {
  Navigate,
  Outlet,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { Note } from "./App";

type NoteLayoutProps = {
  notes: Note[];
};

export function NoteLayout({ notes }: NoteLayoutProps) {
  const { id } = useParams();
  const note = notes.find((n) => n.id === id);
  //Grab the id from URL and find the note that has the same id

  if (note == null) return <Navigate to="/" replace />;
  // don't use === here because note is undefined if it's not found
  // and undefined !== null

  return <Outlet context={note} />;
}

export function useNote() {
  return useOutletContext<Note>();
}
