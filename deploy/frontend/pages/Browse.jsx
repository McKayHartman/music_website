import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import PreviewCard from '../components/PreviewCard';

export default function Browse() {

	const [products, setProducts] = React.useState([]);

	useEffect(() => {
		const productFetch = async () => { 
			const prod = await getProducts() 
			setProducts(prod);
		};

		productFetch();
		console.log(products);

	}, [])

	async function getProducts() {
		try {
			const response = await axios.get(`/api/music-limited`);
			console.log(response.data);
			return response.data || [];
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	}

	const cardsArray = products.map(product => {
					return <PreviewCard key={product.id} music={ product } />
				});

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			{ cardsArray ? cardsArray : <p className="text-gray-500">No products available</p> }

		</div>
	)
}