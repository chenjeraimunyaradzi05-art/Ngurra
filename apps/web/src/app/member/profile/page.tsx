'use client';

import React, { useEffect, useState } from 'react';
import { User, MapPin, Briefcase, GraduationCap, Award, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

interface Experience {
  id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
}

interface CulturalIdentity {
  nation?: string;
  isAboriginal?: boolean;
  isTorresStraitIslander?: boolean;
  isElder?: boolean;
  visibility: 'PUBLIC' | 'COMMUNITY' | 'PRIVATE';
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  culturalIdentity?: CulturalIdentity;
  skills: { id: string; name: string }[];
  experience: Experience[];
  education: Education[];
}

export default function MemberProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { ok, data } = await api<Profile>('/member/profile');
      if (ok && data) {
        setProfile(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const { ok, data } = await api<Profile>('/member/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (ok && data) {
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save profile', error);
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-slate-400">Manage your professional identity</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isEditing 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
        </button>
      </div>

      <div className="grid gap-6">
        {/* Basic Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <div className="text-white">{profile?.firstName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <div className="text-white">{profile?.lastName}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Headline</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={e => setFormData({...formData, headline: e.target.value})}
                  placeholder="e.g. Software Engineer at Tech Co"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <div className="text-white">{profile?.headline || <span className="text-slate-500 italic">No headline added</span>}</div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">About</label>
              {isEditing ? (
                <textarea
                  value={formData.bio || ''}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <div className="text-slate-300 whitespace-pre-wrap">{profile?.bio || <span className="text-slate-500 italic">No bio added</span>}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Sydney, NSW"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  {profile?.location || <span className="text-slate-500 italic">Not specified</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cultural Identity */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-amber-400 text-2xl">🪃</span>
            Cultural Identity
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Nation / Mob</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.culturalIdentity?.nation || ''}
                  onChange={e => setFormData({
                    ...formData, 
                    culturalIdentity: { ...formData.culturalIdentity, nation: e.target.value } as CulturalIdentity
                  })}
                  placeholder="e.g. Wiradjuri, Yolngu"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              ) : (
                <div className="text-white font-medium">{profile?.culturalIdentity?.nation || <span className="text-slate-500 italic">Not specified</span>}</div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditing ? formData.culturalIdentity?.isAboriginal : profile?.culturalIdentity?.isAboriginal}
                  disabled={!isEditing}
                  onChange={e => setFormData({
                    ...formData,
                    culturalIdentity: { ...formData.culturalIdentity, isAboriginal: e.target.checked } as CulturalIdentity
                  })}
                  className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-700"
                />
                <span className="text-slate-300">Aboriginal</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditing ? formData.culturalIdentity?.isTorresStraitIslander : profile?.culturalIdentity?.isTorresStraitIslander}
                  disabled={!isEditing}
                  onChange={e => setFormData({
                    ...formData,
                    culturalIdentity: { ...formData.culturalIdentity, isTorresStraitIslander: e.target.checked } as CulturalIdentity
                  })}
                  className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-700"
                />
                <span className="text-slate-300">Torres Strait Islander</span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditing ? formData.culturalIdentity?.isElder : profile?.culturalIdentity?.isElder}
                  disabled={!isEditing}
                  onChange={e => setFormData({
                    ...formData,
                    culturalIdentity: { ...formData.culturalIdentity, isElder: e.target.checked } as CulturalIdentity
                  })}
                  className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-700"
                />
                <span className="text-slate-300">Community Elder</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-1">Visibility</label>
              {isEditing ? (
                <select
                  value={formData.culturalIdentity?.visibility || 'COMMUNITY'}
                  onChange={e => setFormData({
                    ...formData,
                    culturalIdentity: { ...formData.culturalIdentity, visibility: e.target.value as any } as CulturalIdentity
                  })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="PUBLIC">Public (Visible to everyone)</option>
                  <option value="COMMUNITY">Community (Visible to members)</option>
                  <option value="PRIVATE">Private (Only me)</option>
                </select>
              ) : (
                <div className="text-slate-300">
                  {profile?.culturalIdentity?.visibility === 'PUBLIC' && 'Public'}
                  {profile?.culturalIdentity?.visibility === 'COMMUNITY' && 'Community Only'}
                  {profile?.culturalIdentity?.visibility === 'PRIVATE' && 'Private'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Experience Section (Placeholder for now, can be expanded) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            Experience
          </h2>
          <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
            Experience editing coming soon
          </div>
        </div>

        {/* Education Section (Placeholder) */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            Education
          </h2>
          <div className="text-center py-8 text-slate-500 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
            Education editing coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
