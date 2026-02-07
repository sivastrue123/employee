import React from 'react';
import AIAssistant from './AIAssistant';

interface ChatOverlayProps {
  open: boolean;
  onClose: () => void;
}

const ChatOverlay: React.FC<ChatOverlayProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 rounded-full bg-white/90 text-slate-900 shadow-md px-3 py-1 text-xs font-semibold"
          aria-label="Close chat overlay"
        >
          Close
        </button>
        <AIAssistant />
      </div>
    </div>
  );
};

export default ChatOverlay;

