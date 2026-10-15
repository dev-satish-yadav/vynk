import React, { useState, useEffect } from 'react';
import { X, Search, Users, UserPlus, Check } from 'lucide-react';
import { api } from '../../services/api';
import { User, Conversation } from '../../types';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOneOnOne: (userId: string) => Promise<Conversation | null>;
  onCreateGroup: (title: string, memberIds: string[]) => Promise<Conversation | null>;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onStartOneOnOne,
  onCreateGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Group creation state
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/auth/users?q=${encodeURIComponent(searchQuery)}`);
        setUsers(response.data.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 250);
    return () => clearTimeout(timer);
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || selectedUserIds.length === 0) return;

    setIsSubmitting(true);
    await onCreateGroup(groupTitle.trim(), selectedUserIds);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#111b21] border border-[#2a3942] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#202c33] flex items-center justify-between border-b border-[#2a3942]">
          <h3 className="text-lg font-bold text-[#e9edef]">Start New Conversation</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a3942] bg-[#111b21]">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'direct'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Direct Message
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'group'
                ? 'border-[#00a884] text-[#00a884]'
                : 'border-transparent text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Users className="w-4 h-4" /> New Group
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'group' && (
            <div>
              <label className="block text-xs font-semibold text-[#8696a0] mb-1.5 uppercase tracking-wide">
                Group Subject / Name
              </label>
              <input
                type="text"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="e.g. Project Dev Team"
                className="w-full px-3.5 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-lg text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
              <p className="text-xs text-[#8696a0] mt-1.5">
                Selected members: <span className="text-[#00a884] font-bold">{selectedUserIds.length}</span>
              </p>
            </div>
          )}

          {/* User Search Bar */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#202c33] border border-[#2a3942] rounded-lg">
            <Search className="w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by username or email..."
              className="w-full bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
            />
          </div>

          {/* User List */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#8696a0] uppercase tracking-wide px-1">
              {activeTab === 'direct' ? 'Select Contact' : 'Add Participants'}
            </p>

            {isLoading ? (
              <div className="text-center py-6 text-sm text-[#8696a0]">Loading contacts...</div>
            ) : users.length > 0 ? (
              users.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (activeTab === 'direct') {
                        onStartOneOnOne(u.id);
                        onClose();
                      } else {
                        toggleSelectUser(u.id);
                      }
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#00a884]/20 border border-[#00a884]/40' : 'hover:bg-[#202c33]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#202c33] border border-[#2a3942]">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#e9edef]">{u.username}</h4>
                        <p className="text-xs text-[#8696a0] truncate max-w-[200px]">{u.about || u.email}</p>
                      </div>
                    </div>

                    {activeTab === 'group' && (
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isSelected ? 'bg-[#00a884] border-[#00a884] text-black' : 'border-[#8696a0]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-sm text-[#8696a0]">
                No users found. Invite a teammate or register a test account!
              </div>
            )}
          </div>
        </div>

        {/* Footer for Group */}
        {activeTab === 'group' && (
          <div className="p-4 bg-[#202c33] border-t border-[#2a3942] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[#8696a0] hover:text-[#e9edef]"
            >
              Cancel
            </button>
            <button
              onClick={handleGroupSubmit}
              disabled={isSubmitting || !groupTitle.trim() || selectedUserIds.length === 0}
              className="px-5 py-2 rounded-lg bg-[#00a884] hover:bg-[#06cf9c] text-black font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
