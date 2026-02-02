import React, { useState } from 'react';
import { AIPersona } from '../../types';

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (persona: Omit<AIPersona, 'id'>) => void;
}

const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Custom');
  const [systemInstruction, setSystemInstruction] = useState('');

  const handleSubmit = () => {
    if (name.trim() && description.trim() && systemInstruction.trim()) {
      onCreate({ name, description, category, systemInstruction });
      // Reset form
      setName('');
      setDescription('');
      setCategory('Custom');
      setSystemInstruction('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-2xl text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Custom AI Persona</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">&times;</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Persona Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Grumpy Code Reviewer"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g., Custom, Development"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A short description of this persona's role."
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">System Instruction / Prompt</label>
            <textarea
              value={systemInstruction}
              onChange={e => setSystemInstruction(e.target.value)}
              placeholder="Describe how the AI should behave. e.g., 'You are a senior engineer who is always slightly annoyed. Your code reviews are blunt, sarcastic, but always technically correct...'"
              rows={6}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm font-semibold">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-sm font-semibold">Create Persona</button>
        </div>
      </div>
    </div>
  );
};

export default CreatePersonaModal;