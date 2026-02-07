import React from 'react';
import WorkItemForm from './WorkItemForm';
import { useAppData } from '../context/DataContext';
import { WorkItem } from '../types';

interface WorkItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: WorkItem) => void;
}

const WorkItemModal: React.FC<WorkItemModalProps> = ({ open, onClose, onSave }) => {
  const { teams, users, slaPolicies } = useAppData();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-3xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xs uppercase tracking-wide rounded-full bg-white px-3 py-1 shadow"
        >
          Close
        </button>
        <WorkItemForm
          teams={teams}
          users={users}
          slaPolicies={slaPolicies}
          onSave={(item) => {
            onSave(item);
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default WorkItemModal;

