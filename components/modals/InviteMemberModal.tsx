
import React, { useState, useEffect } from 'react';
import { Check, Link as LinkIcon, Calendar, Mail, Download } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent?: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [projectLink, setProjectLink] = useState('');

  // Generate a stable link when the modal opens if one doesn't exist
  useEffect(() => {
    if (isOpen && !projectLink) {
        setProjectLink(`https://sai.sh/project/${Math.random().toString(36).substring(7)}`);
    }
  }, [isOpen, projectLink]);

  const handleInvite = () => {
    if (email.trim() && email.includes('@')) {
      alert(`Invitation sent to ${email}`);
      setEmail('');
      if (onInviteSent) onInviteSent();
      onClose();
    } else {
      alert('Please enter a valid email address.');
    }
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(projectLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    if (onInviteSent) onInviteSent();
  };

  const getCalendarUrl = (type: 'google' | 'outlook' | 'yahoo') => {
      const title = encodeURIComponent("SAI Collaboration Session");
      const details = encodeURIComponent(`Join me for a live coding session on SAI.\n\nProject Link: ${projectLink}`);
      const location = encodeURIComponent(projectLink);
      
      // Default duration: 1 hour from now
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      const dates = `${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

      switch(type) {
          case 'google':
              return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
          case 'outlook':
              return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${now.toISOString()}&enddt=${end.toISOString()}`;
          case 'yahoo':
              return `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&desc=${details}&in_loc=${location}&st=${dates}`;
          default: return '#';
      }
  };

  const handleDownloadIcs = () => {
      const title = "SAI Collaboration Session";
      const description = `Join me for a live coding session on SAI.\n\nProject Link: ${projectLink}`;
      const location = projectLink;
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SAI//Cloud IDE//EN
BEGIN:VEVENT
UID:${Date.now()}@sai.sh
DTSTAMP:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sai-session.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-[#131b2c] rounded-2xl p-8 w-full max-w-md text-white border border-gray-700 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Share Project & Invite</h2>
        
        <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 block mb-2">Share Link</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    readOnly
                    value={projectLink || 'Generating link...'}
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400"
                />
                <button 
                    onClick={handleCopyLink} 
                    className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${linkCopied ? 'bg-green-600/50 text-green-300' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    {linkCopied ? <Check size={16}/> : <LinkIcon size={16}/>}
                    {linkCopied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>

        <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 block mb-2 flex items-center gap-2">
                <Calendar size={14} /> Add to Calendar
            </label>
            <div className="grid grid-cols-2 gap-2">
                <a 
                    href={getCalendarUrl('google')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-gray-700"
                >
                    Google
                </a>
                <a 
                    href={getCalendarUrl('outlook')} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-gray-700"
                >
                    Outlook
                </a>
                <button 
                    onClick={handleDownloadIcs}
                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-gray-700 col-span-2"
                >
                    <Download size={12} /> Download .ics
                </button>
            </div>
        </div>

        <div className="flex items-center my-6">
            <hr className="flex-1 border-gray-700" />
            <span className="px-4 text-xs text-gray-500">OR</span>
            <hr className="flex-1 border-gray-700" />
        </div>

        <label className="text-sm font-medium text-gray-300 block mb-2">Invite by Email</label>
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button onClick={handleInvite} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold whitespace-nowrap">Send Invite</button>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-sm">Close</button>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;
