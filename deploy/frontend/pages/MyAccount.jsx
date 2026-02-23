import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { clearAuthToken, getAuthHeaders, getAuthToken, setAuthUser } from '../utils/auth.js';

function MyAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUser() {
      if (!getAuthToken()) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/api/auth/me', { headers: getAuthHeaders() });
        setUser(response.data.user);
        setAuthUser(response.data.user);
      } catch (requestError) {
        clearAuthToken();
        setError(requestError?.response?.data?.error || 'Failed to load account');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);

  function handleLogout() {
    clearAuthToken();
    navigate('/login');
  }

  if (loading) return <p className="max-w-md mx-auto mt-10">Loading account...</p>;

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">My Account</h1>
      <p className="text-gray-800"><strong>Email:</strong> {user?.email}</p>
      <p className="text-gray-800 mt-2"><strong>Role:</strong> {user?.role}</p>
      <p className="text-gray-800 mt-2"><strong>User ID:</strong> {user?.id}</p>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700"
      >
        Logout
      </button>
    </div>
  );
}

export default MyAccount;
