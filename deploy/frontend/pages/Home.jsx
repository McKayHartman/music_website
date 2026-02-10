import PreviewCard from '../components/PreviewCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

import axios from 'axios';
import { useState, useEffect } from 'react';



function Home(){

	// API call to get music
	async function fetchMusic() {
		try {
			response = await axios.get(`/api/music-limited`);
			return response;
		} catch(error) {
			console.error(error)
		}
	}

	return (
		<div className='relative min-h-screen'>
			{/* Background image */}
			<div className="fixed inset-0 -z-10 bg-[url('../assets/score_backsplash.jpg')] bg-cover bg-center bg-no-repeat" />



			<div className='flex justify-center my-60 flex-col items-center space-y-8'>
				<h1 className="text-3xl font-bold">Find the Perfect Piece of Music</h1>
				<SearchBar/>
			</div>

			<div>

			</div>

			
		</div>
		
	)
}

export default Home;