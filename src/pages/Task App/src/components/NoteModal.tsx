import React from 'react';
import NoteForm from './NoteForm';
import { useAppData } from '../context/DataContext';

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ open, onClose }) => {
  const { addNote } = useAppData();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow"
        >
          Close
        </button>
        <NoteForm
          onSave={(note) => {
            addNote(note);
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default NoteModal;

