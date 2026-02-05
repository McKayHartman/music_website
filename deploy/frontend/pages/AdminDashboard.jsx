import axios from 'axios';
import MiniCard from '../components/MiniCard.jsx';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [musicPosts, setMusicPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllMusicPosts = async () => {
      try {
        const response = await axios.get('/api/music');
        console.log('Music Posts:', response.data);
        setMusicPosts(response.data);
      } catch (error) {
        console.error('Error fetching music posts:', error);
      } finally {
        setLoading(false);
      }
    };

    getAllMusicPosts();
  }, []);

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
	  <button className="bg-blue-500 text-white px-4 py-2 rounded mb-6 hover:bg-blue-600 transition-colors duration-300">
		<a href="/upload">Upload New Music</a>
	  </button>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex flex-col space-y-4">
        {musicPosts.map(post => (
          <MiniCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
