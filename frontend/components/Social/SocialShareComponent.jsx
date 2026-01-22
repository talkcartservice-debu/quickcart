'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import apiService from '@/services/api';

const SocialShareComponent = ({ content, url, title }) => {
  const { userData } = useAppContext();
  const [socialPlatforms, setSocialPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSocialPlatforms();
  }, []);

  const fetchSocialPlatforms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSocialPlatforms();
      setSocialPlatforms(response.platforms || []);
    } catch (err) {
      setError(err.message || 'Failed to load social platforms');
      console.error('Social platforms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform) => {
    // For sharing, we'll open the share URL in a new window
    const fullContent = content || title || 'Check out this product!';
    const shareUrl = url || window.location.href;
    
    apiService.getSocialShareUrl(platform, fullContent, shareUrl)
      .then(response => {
        if (response.shareUrl) {
          window.open(response.shareUrl, '_blank', 'width=600,height=400');
        }
      })
      .catch(err => {
        console.error(`Error sharing to ${platform}:`, err);
        alert(`Failed to share to ${platform}. Please try again.`);
      });
  };

  const handleSocialLogin = (platform) => {
    // Redirect to social login
    apiService.initiateSocialAuth(platform);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <h3 className="font-bold text-gray-800 mb-3">Share this</h3>
      
      <div className="flex flex-wrap gap-2">
        {socialPlatforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => handleShare(platform.id)}
            className={`px-4 py-2 rounded-lg text-white font-medium capitalize ${
              platform.id === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' :
              platform.id === 'twitter' ? 'bg-blue-400 hover:bg-blue-500' :
              platform.id === 'linkedin' ? 'bg-blue-700 hover:bg-blue-800' :
              platform.id === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' :
              platform.id === 'pinterest' ? 'bg-red-600 hover:bg-red-700' :
              'bg-gray-500 hover:bg-gray-600'
            }`}
            title={`Share on ${platform.name}`}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {userData && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Connect with Social Accounts</h4>
          <div className="flex flex-wrap gap-2">
            {socialPlatforms.map(platform => (
              <button
                key={`login-${platform.id}`}
                onClick={() => handleSocialLogin(platform.id)}
                className={`px-3 py-1.5 rounded-lg text-white text-sm ${
                  platform.id === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' :
                  platform.id === 'twitter' ? 'bg-blue-400 hover:bg-blue-500' :
                  platform.id === 'linkedin' ? 'bg-blue-700 hover:bg-blue-800' :
                  platform.id === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' :
                  platform.id === 'pinterest' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                Connect {platform.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShareComponent;