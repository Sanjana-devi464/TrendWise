'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, User, Mail, Calendar, Edit2, Save, X } from 'lucide-react';
import Avatar from '@/components/Avatar';
import UserStats from '@/components/UserStats';
import UserCommentHistory from '@/components/UserCommentHistory';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    image: session?.user?.image || '',
  });

  // Update form data when session changes
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
      });
    }
  }, [session]);

  // Handle redirect on client side
  useEffect(() => {
    if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      // Upload the image
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await uploadResponse.json();

      // Update the user profile with the new image URL
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: url,
        }),
      });

      if (profileResponse.ok) {
        const updatedUser = await profileResponse.json();
        setFormData(prev => ({ ...prev, image: updatedUser.image }));
        // Update the session
        await update({
          ...session,
          user: {
            ...session.user,
            image: updatedUser.image,
          },
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update the session
        await update({
          ...session,
          user: {
            ...session.user,
            name: updatedUser.name,
          },
        });
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white relative">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="relative">
                <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
                <p className="text-blue-100">Manage your account information</p>
              </div>
            </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image Section */}
              <div className="lg:w-1/3 space-y-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="relative">
                      <Avatar 
                        src={formData.image} 
                        alt="Profile" 
                        size="xl"
                        className="w-32 h-32"
                      />
                      
                      {/* Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Click the camera icon to upload a new profile picture
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max file size: 5MB
                  </p>
                </div>

                {/* User Stats */}
                {session?.user?.id && (
                  <UserStats userId={session.user.id} />
                )}

                {/* Comment History */}
                <UserCommentHistory />
              </div>

              {/* Profile Information */}
              <div className="lg:w-2/3">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {formData.name || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600">
                      {formData.email}
                      <span className="text-xs text-gray-400 ml-2">(Cannot be changed)</span>
                    </div>
                  </div>

                  {/* Account Created */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member Since
                    </label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-600">
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: session?.user?.name || '',
                              email: session?.user?.email || '',
                              image: session?.user?.image || '',
                            });
                          }}
                          className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
