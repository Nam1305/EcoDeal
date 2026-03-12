import React, { useEffect, useState } from 'react';
import userService from '../services/userService';
import type { UserProfileDto, UpdateUserProfileRequest } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [formData, setFormData] = useState<UpdateUserProfileRequest>({
        fullName: '',
        phoneNumber: '',
        address: '',
        latitude: 0,
        longitude: 0
    });

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setProfile(data);
                setFormData({
                    fullName: data.fullName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0
                });
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user, navigate, authLoading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let parsedValue: any = value;
        if (type === 'number') parsedValue = Number(value);
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userService.updateProfile(formData);
            setProfile(prev => prev ? { ...prev, ...formData } : null);
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
        } catch (err: any) {
            alert('Update failed: ' + (err.response?.data?.message || 'Unknown error'));
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center py-12">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-teal-400 h-32 relative">
                    <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {/* Avatar Placeholder */}
                            <span className="text-3xl font-bold text-gray-500">
                                {profile?.fullName?.charAt(0) || 'U'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{profile?.fullName}</h1>
                            <p className="text-gray-500">{profile?.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                                {profile?.role} Role
                            </span>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {saveSuccess && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <span>✅ Profile updated successfully!</span>
                        </div>
                    )}

                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                <div>
                                    <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-1">Phone Number</h3>
                                    <p className="text-gray-800 font-medium">{profile?.phoneNumber || <span className="text-gray-400 italic">Not provided</span>}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-1">Location Coordinates</h3>
                                    <p className="text-gray-800 font-medium font-mono text-sm">
                                        Lat: {profile?.latitude || 'N/A'}, Lng: {profile?.longitude || 'N/A'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-1">Address</h3>
                                    <p className="text-gray-800 font-medium">{profile?.address || <span className="text-gray-400 italic">Not provided</span>}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 mt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form data back to profile state if canceled
                                        if (profile) {
                                            setFormData({
                                                fullName: profile.fullName || '',
                                                phoneNumber: profile.phoneNumber || '',
                                                address: profile.address || '',
                                                latitude: profile.latitude || 0,
                                                longitude: profile.longitude || 0
                                            });
                                        }
                                    }}
                                    className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
