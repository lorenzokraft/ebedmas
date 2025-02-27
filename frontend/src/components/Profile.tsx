import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardNav from './DashboardNav';
import { useNavigate } from 'react-router-dom';
import { User, Users, Plus, Edit3, Save, X, CreditCard, BookOpen } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  subscription?: {
    plan: string;
    maxLearners: number;
    additionalLearners: number;
  };
}

interface Learner {
  id: number;
  name: string;
  age: number;
  grade: string;
  subjects: string[];
  created_at: string;
}

interface Subscription {
  plan: string;
  type: 'monthly' | 'annually';
  maxLearners: number;
  additionalLearners: number;
  subjects: string[];
  cardType?: string;
  lastFourDigits?: string;
  price: number;
  billingEmail: string;
  nextBillingDate: string;
}

interface Profile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  status: string;
  subscription: Subscription;
}

interface Grade {
  id: number;
  name: string;
  description?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [showAddLearner, setShowAddLearner] = useState(false);
  const [newLearner, setNewLearner] = useState({ name: '', grade: '', subjects: [] });
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchProfileData();
    fetchLearners();
    fetchGrades();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.subscription) {
        response.data.subscription = {
          ...response.data.subscription,
          maxLearners: parseInt(response.data.subscription.maxLearners) || 0,
          subjects: Array.isArray(response.data.subscription.subjects) ? 
                   response.data.subscription.subjects : []
        };
      }
      
      setProfile(response.data);
      setEditedProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const fetchLearners = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/learners', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLearners(response.data.map((learner: any) => ({
        ...learner,
        subjects: [] // Since we don't have subjects in the database yet
      })));
    } catch (error) {
      console.error('Error fetching learners:', error);
      toast.error('Failed to load learners data');
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/grades/all');
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    }
  };

  const canAddLearner = () => {
    if (!profile?.subscription) return false;
    return learners.length < profile.subscription.maxLearners;
  };

  const handleAddLearner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddLearner()) {
      toast.error(`You have reached your maximum number of learners (${profile?.subscription?.maxLearners || 0}). Please upgrade your plan.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/learners',
        {
          learners: [{
            name: newLearner.name,
            grade: newLearner.grade
          }]
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        await fetchLearners(); // Refresh the learners list
        setShowAddLearner(false);
        setNewLearner({ name: '', grade: '', subjects: [] });
        toast.success('Learner added successfully');
      }
    } catch (error: any) {
      console.error('Error adding learner:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add learner. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updatedUsername = `${editedProfile?.firstName} ${editedProfile?.lastName}`.trim();
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        { username: updatedUsername },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setProfile(response.data);
      setEditedProfile(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const renderSubscriptionInfo = () => {
    if (!profile?.subscription) return null;

    const {
      plan,
      type,
      maxLearners,
      subjects,
      cardType,
      lastFourDigits,
      nextBillingDate
    } = profile.subscription;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Subscription Details
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-medium">{plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing Cycle:</span>
            <span className="font-medium">{type === 'annually' ? 'Yearly' : 'Monthly'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Learners:</span>
            <span className="font-medium">{maxLearners}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Available Subjects:</span>
            <div className="text-right">
              {subjects && subjects.map((subject, index) => (
                <div key={index} className="font-medium">{subject}</div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Card Details:</span>
            <span className="font-medium">
              {cardType && lastFourDigits 
                ? `${cardType} ending in ${lastFourDigits}`
                : 'Not provided'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Billing:</span>
            <span className="font-medium">
              {nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav logout={handleLogout} />
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav logout={handleLogout} />
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <User className="w-6 h-6 mr-2 text-gray-600" />
                My Profile
              </h2>
              {!isEditing && profile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editedProfile?.username || ''}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedProfile?.email || ''}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedProfile?.firstName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedProfile?.lastName || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editedProfile?.phone || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(profile);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium text-gray-900">{profile?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">{profile?.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium text-gray-900">{profile?.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{profile?.phone || 'Not provided'}</p>
                </div>
                
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold flex items-center">
                <Users className="w-6 h-6 mr-2 text-gray-600" />
                My Learners
              </h2>
              <button
                onClick={() => setShowAddLearner(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
                disabled={!canAddLearner()}
              >
                + Add Learner
              </button>
            </div>

            {showAddLearner && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Add New Learner</h3>
                <form onSubmit={handleAddLearner} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newLearner.name}
                      onChange={(e) => setNewLearner({ ...newLearner, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <select
                      value={newLearner.grade}
                      onChange={(e) => setNewLearner({ ...newLearner, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option key="default" value="">Select a grade</option>
                      {grades.map((grade) => (
                        <option key={`grade-${grade.id}`} value={grade.name}>
                          {grade.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddLearner(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Add Learner
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="p-6">
              {learners.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No learners added yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {learners.map((learner) => (
                    <div key={learner.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{learner.name}</h3>
                      <p className="text-gray-600">Grade: {learner.grade}</p>
                      <p className="text-gray-500 text-sm mt-2">Added: {new Date(learner.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {profile?.subscription && (
            renderSubscriptionInfo()
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
