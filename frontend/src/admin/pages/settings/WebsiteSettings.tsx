import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';
import Swal from 'sweetalert2';

interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

const WebsiteSettings = () => {
  const [settings, setSettings] = useState<WebsiteSettings>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    supportPhone: '',
    maintenanceMode: false,
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/admin/settings/website');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      Swal.fire('Error', 'Failed to fetch website settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/admin/settings/website', settings);
      Swal.fire('Success', 'Website settings updated successfully', 'success');
    } catch (error) {
      console.error('Error updating settings:', error);
      Swal.fire('Error', 'Failed to update website settings', 'error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Website Settings</h1>

        <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Phone
                </label>
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Facebook URL"
                  value={settings.socialLinks.facebook}
                  onChange={(e) => setSettings({
                    ...settings,
                    socialLinks: {...settings.socialLinks, facebook: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="url"
                  placeholder="Twitter URL"
                  value={settings.socialLinks.twitter}
                  onChange={(e) => setSettings({
                    ...settings,
                    socialLinks: {...settings.socialLinks, twitter: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={settings.socialLinks.instagram}
                  onChange={(e) => setSettings({
                    ...settings,
                    socialLinks: {...settings.socialLinks, instagram: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteSettings; 