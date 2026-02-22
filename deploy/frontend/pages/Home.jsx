import PreviewCard from '../components/PreviewCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



function Home(){
	const [recentMusic, setRecentMusic] = useState([]);
	const navigate = useNavigate();

	// API call to get music
	async function fetchMusic() {
		try {
			const response = await axios.get(`/api/music-limited`);
			setRecentMusic(response.data);
		} catch(error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchMusic();
	}, []);

	const handleSearch = (query) => {
		// Navigate to browse page with search query
		navigate(`/music?search=${encodeURIComponent(query)}`);
	};

	return (
		<div className='relative min-h-screen'>
			{/* Background image */}
			<div className="fixed inset-0 -z-10 bg-[url('../assets/score_backsplash.jpg')] bg-cover bg-center bg-no-repeat" />



			<div className='flex justify-center my-60 flex-col items-center space-y-8'>
				<h1 className="text-3xl font-bold">Find the Perfect Piece of Music</h1>
				<SearchBar onSearch={handleSearch}/>
			</div>

			{/* Recent Music Section */}
			<div className="max-w-6xl mx-auto px-4 py-8">
				<h2 className="text-2xl font-bold mb-6 text-center">Recently Added</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{recentMusic.map(music => (
						<PreviewCard key={music.id} music={music} />
					))}
				</div>
			</div>

			
		</div>
		
	)
}

export default Home;