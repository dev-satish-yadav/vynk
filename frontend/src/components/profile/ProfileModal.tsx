import React, { useState } from 'react';
import { X, Camera, Check, User as UserIcon, Mail, Info, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuthStore();
  const [about, setAbout] = useState(user?.about || 'Available');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data.data.fileUrl;
      setAvatarUrl(uploadedUrl);
    } catch (err: any) {
      alert('Avatar upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setAvatarUrl(newAvatar);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile({
      about: about.trim(),
      ...(avatarUrl ? { avatarUrl } : {}),
    });
    setIsSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const currentAvatarDisplay =
    avatarUrl ||
    user.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || 'user'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white border border-[#EBEEF5] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white flex items-center justify-between border-b border-[#EBEEF5]">
          <h3 className="text-base font-bold text-gray-900">Profile Settings</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <img
                src={currentAvatarDisplay}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#635BFF]/20 shadow-md bg-gray-50"
              />
              <label
                title="Change Avatar"
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 mb-0.5" />
                <span className="text-[10px] font-semibold">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-semibold">
                  Uploading...
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="mt-2 text-xs font-bold text-[#635BFF] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Generate Random Avatar
            </button>
          </div>

          {/* Read-Only Username */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Username</label>
            <div className="flex items-center px-4 py-2.5 bg-gray-50 border border-[#EBEEF5] rounded-xl text-gray-500 text-xs">
              <UserIcon className="w-4 h-4 mr-2.5 text-gray-400" />
              <span>{user.username}</span>
            </div>
          </div>

          {/* Read-Only Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
            <div className="flex items-center px-4 py-2.5 bg-gray-50 border border-[#EBEEF5] rounded-xl text-gray-500 text-xs">
              <Mail className="w-4 h-4 mr-2.5 text-gray-400" />
              <span>{user.email}</span>
            </div>
          </div>

          {/* Editable Status / About */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">About / Bio</label>
            <div className="flex items-center px-4 py-2.5 bg-white border border-[#EBEEF5] rounded-xl focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/10 transition">
              <Info className="w-4 h-4 mr-2.5 text-gray-400" />
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Hey there! I am using Vynk."
                className="w-full bg-transparent text-xs text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Success message */}
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5248E5] text-white font-bold text-xs shadow-md shadow-[#635BFF]/25 disabled:opacity-40 transition flex items-center gap-1.5"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
