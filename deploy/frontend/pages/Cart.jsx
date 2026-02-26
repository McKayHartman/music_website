import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders, isAuthenticated } from '../utils/auth.js';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(currentCart);
    calculateTotal(currentCart);
  }

  function calculateTotal(cartItems) {
    const sum = cartItems.reduce((acc, item) => acc + Number(item.price), 0);
    setTotal(sum);
  }

  function removeFromCart(itemId) {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    calculateTotal(updatedCart);
  }

  async function handleCheckout() {
    setCheckoutError('');

    if (!isAuthenticated()) {
      navigate('/login', {
        state: {
          redirectTo: '/cart',
          message: 'Please log in to complete your purchase.'
        }
      });
      return;
    }

    try {
      setIsCheckingOut(true);

      const response = await axios.post(
        '/api/checkout/create-session',
        { productIds: cart.map((item) => item.id) },
        { headers: getAuthHeaders() }
      );

      window.location.assign(response.data.url);
    } catch (error) {
      setCheckoutError(
        error?.response?.data?.error || 'Failed to start checkout. Please try again.'
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <Link
              to="/music"
              className="bg-slate-800 text-white px-6 py-2 rounded hover:bg-slate-700 transition-colors"
            >
              Browse Music
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {cart.map((item) => (
              <div key={item.id} className="p-6 flex items-center">
                <img
                  src={`/${item.thumbnail_path}`}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                  onError={(e) => {
                    e.target.src = '/placeholder-music.jpg';
                  }}
                />

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">by {item.composer}</p>
                  {item.arranger && (
                    <p className="text-sm text-gray-500">arranged by {item.arranger}</p>
                  )}
                </div>

                <div className="text-right mr-4">
                  <p className="text-lg font-semibold text-text-price">${item.price}</p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-bg-secondary px-6 py-4 border-t border-border-primary">
            {checkoutError && (
              <p className="mb-3 text-sm text-red-600">{checkoutError}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-text-primary">Total: <span className="text-text-price">${total.toFixed(2)}</span></span>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-brand-secondary text-bg-primary px-8 py-2 rounded-lg hover:bg-brand-secondary-hover transition-colors"
              >
                {isCheckingOut ? 'Redirecting...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
