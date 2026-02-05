import React from "react";
import { useState } from "react";
import PreviewCard from "../components/PreviewCard.jsx";
import axios from "axios";


function UploadPage() {

	// Text inputs
	const [title, setTitle] = useState("");
	const [composer, setComposer] = useState("");
	const [arranger, setArranger] = useState("");
	const [price, setPrice] = useState(0);
	
	// File inputs
	const [pdfFile, setPdfFile] = useState(null);
	const [mp3File, setMp3File] = useState(null);




	async function handleSubmit(e) {
		e.preventDefault();

		if (!title || !composer || !pdfFile) {
			alert('Please fill in all required fields.');
			return;
		}

		const formData = new FormData();
		formData.append('title', title);
		formData.append('composer', composer);
		formData.append('arranger', arranger);
		formData.append('price', price);
		formData.append('pdf', pdfFile);
		if (mp3File) {
			formData.append('mp3', mp3File);
		}
		



		console.log("Form data:", formData);

		const response =  await axios.post('/api/music-posts', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});

		if (response.status === 201) {
			alert('Music uploaded successfully!');
			// Clear form
			setTitle("");
			setComposer("");
			setArranger("");
			setPdfFile(null);
			setMp3File(null);
			setPrice(0);
		} else {
			alert('Failed to upload music. ' + response?.data?.error || error.message);
		}

	}


	return (
		<>
			<form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col items-center space-y-4 mt-10">

				<h1 className="text-3xl font-bold">Upload Music</h1>

				<input 
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}>
				</input>

				<input
					type="text"
					placeholder="Composer"
					value={composer}
					onChange={(e) => setComposer(e.target.value)}>
				</input>

				<input 
					type="text" 
					placeholder="Arranger (optional)" 
					value={arranger} 
					onChange={(e) => setArranger(e.target.value)}>
				</input>

				<label className="text-sm text-gray-600">Upload a PDF file</label>
				<input 
					type="file" 
					name="pdf" 
					accept="application/pdf" 
					onChange={(e) => setPdfFile(e.target.files[0])}>
				</input>

				<label className="text-sm text-gray-600">Upload an MP3 file (optional)</label>
				<input 
					type="file" 
					name="mp3" 
					accept="audio/mpeg" 
					onChange={(e) => { setMp3File(e.target.files[0])
					console.log("mp3 file:", e.target.files[0]);
					 }}>
				</input>

				<label className="text-sm text-gray-600 mt-6">Price:</label>
				<input 
					type="number" 
					value={price} 
					onChange={(e) => setPrice(e.target.value)} 
					placeholder="Price in USD" 
					min="0" step="0.01" 
					className="border border-gray-300 rounded px-3 py-2 w-32 text-center">
				</input>

				<button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Upload Music</button>

			</form>

		</>
	)

}

export default UploadPage;