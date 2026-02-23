import { useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { setAuthSession } from '../utils/auth.js';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.redirectTo;
  const loginMessage = location.state?.message;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setAuthSession(response.data.token, response.data.user);
      if (response.data.user?.role === 'admin') {
        navigate('/admin');
        return;
      }

      navigate(redirectTo || '/my-account');
    } catch (requestError) {
      setError(requestError?.response?.data?.error || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {loginMessage && (
        <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {loginMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 disabled:opacity-70"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-700">
        Need an account? <Link to="/create-account" className="text-blue-700 hover:underline">Create one</Link>
      </p>
    </div>
  );
}

export default Login;
