import axios from 'axios';


export default function MiniCard({ post}) {

	const cardClasses = `flex flex-row justify-between w-full h-min border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300`;


	

	return (
		<>
			<div key={post.id} className={cardClasses}>
				<h3 className="text-lg font-semibold mb-2">{post.title}</h3>
				<p className="text-gray-700">Composer: {post.composer}</p>
				{post.arranger && <p className="text-gray-700">Arranger: {post.arranger}</p>}
				<p className="text-gray-700">Price: ${post.price}</p>
				<div>
					<button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-300">
						Delete
					</button>
					<button className="bg-green-500 text-white px-4 py-2 rounded ml-2 hover:bg-green-600 transition-colors duration-300">
						Edit
					</button>
				</div>
			</div>
			
		</>


	);
}