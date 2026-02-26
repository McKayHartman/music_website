import {useState} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'


function PreviewCard({ music }) {
	
	const imageUrl = `/${music.thumbnail_path}`;

	const cardClasses = `
		flex flex-col md:flex-row gap-4
		w-full
		bg-white
		border border-gray-200
		rounded-xl
		p-4
		shadow-sm
		hover:shadow-lg
		hover:-translate-y-1
		transition-all duration-300 ease-in-out
		h-64
		overflow-hidden
	`;

	  return (
		<div>
			<Link to={`/music/${music.id}`} className= {cardClasses}>
				<img className="object-cover w-full rounded-base h-40 md:h-full md:w-36 mb-4 md:mb-0" src={imageUrl} alt="Image not found" />
				<div className="flex flex-col justify-between md:p-4 leading-normal h-full overflow-hidden">
					<div>
						<h5 className="text-xl font-bold tracking-tight text-gray-900">{music.title}</h5>
						<p className="text-sm text-gray-600">by {music.composer}</p>
						{music.arranger && <p className="text-sm text-gray-600">arranged by {music.arranger}</p>}
					</div>
				</div>
			</Link>


		</div>
	)
}

export default PreviewCard;
