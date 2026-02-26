import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders, getAuthToken } from '../utils/auth.js';

export default function MyPurchases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloadingProductId, setDownloadingProductId] = useState(null);

  useEffect(() => {
    async function initializePurchasesPage() {
      setLoading(true);
      setError('');

      const checkoutStatus = searchParams.get('checkout');
      const sessionId = searchParams.get('session_id');

      if (checkoutStatus === 'success' && sessionId) {
        try {
          await axios.post(
            '/api/checkout/complete-session',
            { sessionId },
            { headers: getAuthHeaders() }
          );
          localStorage.removeItem('cart');
          setCheckoutMessage('Payment completed successfully. Your purchase is now available below.');
        } catch (sessionError) {
          console.error('Error finalizing checkout session:', sessionError);
          setCheckoutMessage(
            sessionError?.response?.data?.error ||
              'Payment was successful, but purchase sync is still processing. Refresh in a moment.'
          );
        }
      }

      await fetchPurchases();
    }

    if (!getAuthToken()) {
      navigate('/login', {
        state: {
          redirectTo: '/my-purchases',
          message: 'Please log in to view your purchases.'
        }
      });
      return;
    }

    initializePurchasesPage();
  }, [navigate, searchParams]);

  async function fetchPurchases() {
    try {
      const response = await axios.get('/api/purchases', { headers: getAuthHeaders() });
      setPurchases(response.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate('/login', {
          state: {
            redirectTo: '/my-purchases',
            message: 'Please log in to view your purchases.'
          }
        });
        return;
      }

      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(purchase) {
    setDownloadError('');
    setDownloadingProductId(purchase.product_id);

    try {
      const response = await axios.get(
        `/api/purchases/${purchase.product_id}/download`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const contentDisposition = response.headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const fallbackName = `${String(purchase.title || 'music').replace(/[^a-zA-Z0-9-_]+/g, '_')}.pdf`;
      const filename = filenameMatch?.[1] || fallbackName;

      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadRequestError) {
      let message = 'Failed to download file. Please try again.';
      const errorBlob = downloadRequestError?.response?.data;

      if (errorBlob instanceof Blob && errorBlob.type.includes('application/json')) {
        try {
          const parsed = JSON.parse(await errorBlob.text());
          if (parsed?.error) {
            message = parsed.error;
          }
        } catch {
          // Keep fallback message when error payload is not valid JSON
        }
      }

      setDownloadError(message);
    } finally {
      setDownloadingProductId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your purchases...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Purchases</h1>

        {checkoutMessage && (
          <p className="mb-6 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {checkoutMessage}
          </p>
        )}
        {downloadError && (
          <p className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {downloadError}
          </p>
        )}

        {purchases.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">You haven't made any purchases yet</p>
            <Link
              to="/music"
              className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Browse Music
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="p-6 flex items-center">
                  <img
                    src={`/${purchase.thumbnail_path}`}
                    alt={purchase.title}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                    onError={(e) => {
                      e.target.src = '/placeholder-music.jpg';
                    }}
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{purchase.title}</h3>
                    <p className="text-gray-600">by {purchase.composer}</p>
                    {purchase.arranger && (
                      <p className="text-sm text-gray-500">arranged by {purchase.arranger}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Purchased on {new Date(purchase.purchase_date).toLocaleDateString()}
                    </p>
                    {Number(purchase.quantity) > 1 && (
                      <p className="text-sm text-gray-500">Quantity: {purchase.quantity}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-text-price">${purchase.price}</p>
                    <button
                      onClick={() => handleDownload(purchase)}
                      disabled={downloadingProductId === purchase.product_id}
                      className="text-brand-secondary hover:text-brand-secondary-hover text-sm mt-1 disabled:opacity-60"
                    >
                      {downloadingProductId === purchase.product_id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
