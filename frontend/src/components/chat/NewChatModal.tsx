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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border border-borderSubtle rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white flex items-center justify-between border-b border-borderSubtle">
          <h3 className="text-base font-bold text-gray-900">New Message</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-borderSubtle bg-gray-50/50">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'direct'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Direct Message
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'group'
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" /> New Group
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'group' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="e.g. Project Development Team"
                className="w-full px-4 py-2.5 bg-gray-50 border border-borderSubtle rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white transition"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Selected members: <span className="text-primary font-bold">{selectedUserIds.length}</span>
              </p>
            </div>
          )}

          {/* User Search Bar */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border border-borderSubtle rounded-xl">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by username or email..."
              className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* User List */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
              {activeTab === 'direct' ? 'Available Contacts' : 'Add Participants'}
            </p>

            {isLoading ? (
              <div className="text-center py-6 text-xs text-gray-400">Loading contacts...</div>
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
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-primary-light text-primary border border-primary/30'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.username}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-primary/20"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{u.username}</h4>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{u.email}</p>
                      </div>
                    </div>

                    {activeTab === 'group' && (
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No users found.
              </div>
            )}
          </div>
        </div>

        {/* Footer for Group */}
        {activeTab === 'group' && (
          <div className="p-4 bg-gray-50 border-t border-borderSubtle flex justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGroupSubmit}
              disabled={isSubmitting || !groupTitle.trim() || selectedUserIds.length === 0}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs shadow-md shadow-primary/25 disabled:opacity-40 transition"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
