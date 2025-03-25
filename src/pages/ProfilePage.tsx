import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PenSquare, Calendar, Edit3 } from 'lucide-react';
import PoemCard from '../components/PoemCard';
import { useAuthStore, usePoemStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile: currentUserProfile } = useAuthStore();
  const { userPoems, fetchUserPoems } = usePoemStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  });

  const isOwnProfile = !id || (user && id === user.id);
  const displayedProfile = isOwnProfile ? currentUserProfile : profile;

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        if (isOwnProfile && currentUserProfile) {
          setProfile(currentUserProfile);
          setFormData({
            display_name: currentUserProfile.display_name || '',
            bio: currentUserProfile.bio || '',
            avatar_url: currentUserProfile.avatar_url || '',
          });
          await fetchUserPoems(currentUserProfile.id);
        } else if (id) {
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

          if (profileError) throw profileError;

          setProfile(profileData);
          await fetchUserPoems(id);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, isOwnProfile, currentUserProfile, fetchUserPoems]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh the profile
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!displayedProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-bold mb-4">Profile not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 text-4xl mr-6">
              {displayedProfile.avatar_url ? (
                <img
                  src={displayedProfile.avatar_url}
                  alt={displayedProfile.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                displayedProfile.username.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">
                {displayedProfile.display_name || displayedProfile.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">@{displayedProfile.username}</p>
            </div>
          </div>
          {isOwnProfile && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                className="input"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, display_name: e.target.value }))
                }
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="input"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              ></textarea>
            </div>

            <div>
              <label htmlFor="avatar_url" className="block text-sm font-medium mb-1">
                Avatar URL
              </label>
              <input
                type="url"
                id="avatar_url"
                className="input"
                value={formData.avatar_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, avatar_url: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            {displayedProfile.bio && (
              <p className="text-lg mb-6">{displayedProfile.bio}</p>
            )}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar size={16} className="mr-2" />
              <span>
                Joined {new Date(displayedProfile.created_at).toLocaleDateString()}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold">Poems</h2>
        {isOwnProfile && (
          <Link to="/write" className="btn btn-primary flex items-center space-x-2">
            <PenSquare size={18} />
            <span>Write New Poem</span>
          </Link>
        )}
      </div>

      {userPoems.length > 0 ? (
        <div>
          {userPoems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isOwnProfile
              ? "You haven't written any poems yet"
              : "This user hasn't written any poems yet"}
          </p>
          {isOwnProfile && (
            <Link to="/write" className="btn btn-primary">
              Write your first poem
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;