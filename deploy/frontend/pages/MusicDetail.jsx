import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders, getAuthToken } from '../utils/auth.js';

export default function MusicDetail() {
  const { id } = useParams();
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');

  function handleAddToCart() {
    if (alreadyPurchased) {
      alert('You already purchased this item.');
      return;
    }

    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item is already in cart
    const existingItem = currentCart.find(item => item.id === music.id);
    
    if (existingItem) {
      alert('This item is already in your cart!');
      return;
    }
    
    // Add item to cart
    const cartItem = {
      id: music.id,
      title: music.title,
      composer: music.composer,
      arranger: music.arranger,
      price: Number(music.price),
      thumbnail_path: music.thumbnail_path
    };
    
    currentCart.push(cartItem);
    
    // Save back to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    alert('Added to cart successfully!');
  }

  async function handleListenToMp3() {
    setAudioError('');

    if (!getAuthToken()) {
      alert('Please log in and purchase this item to listen to the MP3.');
      return;
    }

    if (!alreadyPurchased) {
      alert('Please purchase this item before listening to the MP3.');
      return;
    }

    try {
      if (!audioRef.current) {
        let playbackUrl = audioUrlRef.current;

        if (!playbackUrl) {
          const response = await axios.get(
            `/api/purchases/${music.id}/download?format=mp3`,
            {
              headers: getAuthHeaders(),
              responseType: 'blob'
            }
          );
          playbackUrl = window.URL.createObjectURL(response.data);
          audioUrlRef.current = playbackUrl;
        }

        const audio = new Audio(playbackUrl);
        audio.addEventListener('ended', () => setIsPlayingPreview(false));
        audioRef.current = audio;
      }

      if (isPlayingPreview) {
        audioRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        await audioRef.current.play();
        setIsPlayingPreview(true);
      }
    } catch (playbackError) {
      console.error('Error playing MP3 preview:', playbackError);
      setAudioError('Unable to play this MP3 right now.');
      setIsPlayingPreview(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        window.URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = '';
      }
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingPreview(false);
    }
    if (audioUrlRef.current) {
      window.URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }

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

    const checkPurchasedStatus = async () => {
      if (!getAuthToken()) {
        setAlreadyPurchased(false);
        return;
      }

      try {
        const response = await axios.get('/api/purchases', { headers: getAuthHeaders() });
        const isPurchased = response.data.some(
          (purchase) => Number(purchase.product_id) === Number(id)
        );
        setAlreadyPurchased(isPurchased);
      } catch (err) {
        console.error('Error checking purchase status:', err);
      }
    };

    if (id) {
      fetchMusicDetail();
      checkPurchasedStatus();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        window.URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = '';
      }
    };
  }, []);

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

  const imageUrl = `/${music.thumbnail_path}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg overflow-hidden">
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
              <div className="text-2xl font-semibold text-text-price mb-6">
                ${music.price}
              </div>
              {audioError && (
                <p className="mb-4 text-sm text-red-600">{audioError}</p>
              )}

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleListenToMp3}
                  disabled={!alreadyPurchased}
                  className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPlayingPreview ? 'Pause MP3' : alreadyPurchased ? 'Listen to MP3' : 'Purchase to Listen'}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={alreadyPurchased}
                  className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {alreadyPurchased ? 'Already Purchased' : 'Add to Cart'}
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
