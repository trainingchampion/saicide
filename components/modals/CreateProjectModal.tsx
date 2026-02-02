
import React, { useState } from 'react';
import { TeamMember } from '../../types';
import { Mail, Send } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; memberIds: string[] }) => void;
  teamMembers: TeamMember[];
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSubmit, teamMembers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ title, description, memberIds: selectedMemberIds });
      setTitle('');
      setDescription('');
      setSelectedMemberIds([]);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };
  
  const handleInvite = () => {
      if (inviteEmail.trim() && inviteEmail.includes('@')) {
          alert(`Invitation sent to ${inviteEmail}. They will be added to your team and can be assigned to projects once they accept.`);
          setInviteEmail('');
      } else {
          alert('Please enter a valid email address.');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-lg text-white border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Q3 Infrastructure Audit"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A brief description of the project's goals."
              className="w-full h-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Assign Team Members</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-900/50 rounded-lg border border-gray-700">
              {teamMembers.map(member => (
                <label key={member.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-700/50 rounded-md">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm">{member.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-gray-700/50">
             <label className="text-sm font-medium text-gray-300 block mb-2">Invite New Member by Email</label>
             <div className="flex gap-2">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="teammate@example.com"
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button 
                    onClick={handleInvite}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold whitespace-nowrap flex items-center gap-2"
                >
                    <Send size={14} />
                    Invite
                </button>
             </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold">Create Project</button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
