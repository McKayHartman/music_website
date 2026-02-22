import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthSession } from '../utils/auth.js';

function CreateAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/register', { email, password });
      setAuthSession(response.data.token, response.data.user);
      navigate('/');
    } catch (requestError) {
      setError(requestError?.response?.data?.error || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-200 rounded-lg bg-white">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>

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
          minLength={8}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-70"
        >
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-700">
        Already have an account? <Link to="/login" className="text-blue-700 hover:underline">Login</Link>
      </p>
    </div>
  );
}

export default CreateAccount;
