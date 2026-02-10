import {useState} from 'react';
import axios from 'axios'


function PreviewCard({ music }) {
	console.log(music.thumbnail_path);
	  return (
		<div>
			<a href="#" className="flex flex-col items-center bg-white shadow-xs md:flex-row ">
				<img className="object-cover w-full rounded-base h-64 md:h-auto md:w-48 mb-4 md:mb-0" src="/home/mckay/Personal_Projects/music_website/deploy/backend/uploads/thumbnails/1770690753480-A-1.4 - Mental_Models_watermarked.jpg" alt="Test Image" />
				<div className="flex flex-col justify-between md:p-4 leading-normal">
					<div>
						<h5 className="text-xl font-bold tracking-tight text-gray-900">{music.title}</h5>
						<p className="text-sm text-gray-600">by {music.composer}</p>
						{music.arranger && <p className="text-sm text-gray-600">arranged by {music.arranger}</p>}
					</div>
				</div>
			</a>


		</div>
	)
}

export default PreviewCard;