import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function MusicDetail() {
  const { id } = useParams();
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMusicDetail = async () => {
      try {
        const response = await axios.get(`/api/music-limited/${id}`);
        setMusic(response.data);
      } catch (err) {
        console.error('Error fetching music detail:', err);
        if (err.response?.status === 404) {
          setError('Music piece not found');
        } else {
          setError('Failed to load music piece');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMusicDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading music piece...</p>
      </div>
    );
  }

  if (error || !music) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Music piece not found'}</p>
        </div>
      </div>
    );
  }

  const imageUrl = `http://localhost:3000/${music.thumbnail_path}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with image and basic info */}
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={imageUrl}
                alt={music.title}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-music.jpg'; // Fallback image
                }}
              />
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{music.title}</h1>
              <p className="text-xl text-gray-600 mb-2">by {music.composer}</p>
              {music.arranger && (
                <p className="text-lg text-gray-500 mb-4">arranged by {music.arranger}</p>
              )}
              <div className="text-2xl font-semibold text-green-600 mb-6">
                ${music.price}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Preview PDF
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Listen to MP3
                </button>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Purchase
                </button>
              </div>
            </div>
          </div>

          {/* Additional details section */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-gray-900">{music.title}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Composer:</span>
                <span className="ml-2 text-gray-900">{music.composer}</span>
              </div>
              {music.arranger && (
                <div>
                  <span className="font-medium text-gray-700">Arranger:</span>
                  <span className="ml-2 text-gray-900">{music.arranger}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Price:</span>
                <span className="ml-2 text-gray-900">${music.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}