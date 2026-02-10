import axios from 'axios';
import MiniCard from '../components/MiniCard.jsx';
import { useEffect, useState } from 'react';
import "../styles/ButtonStyles.css"

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
    <div className='m-1'> 
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <button id="upload" className="button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>

        <a href="/upload">Upload New Music</a>
      </button>
      

      <div className="flex flex-col align-items-start space-y-1">
        {musicPosts.map(post => (
          <MiniCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
