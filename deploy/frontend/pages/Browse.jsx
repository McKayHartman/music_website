import React from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import PreviewCard from '../components/PreviewCard';
import SearchBar from '../components/SearchBar';

export default function Browse() {

	const [products, setProducts] = React.useState([]);
	const [page, setPage] = React.useState(1);
	const [pageSize] = React.useState(8);
	const [total, setTotal] = React.useState(null);
	const [loading, setLoading] = React.useState(false);

	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('search') || '';

	useEffect(() => {
		// fetch products for current page
		const productFetch = async () => { 
			setLoading(true);
			const prod = await getProducts(page, pageSize);
			if (prod) {
				// if backend returned pagination wrapper
				if (prod.items) {
					setProducts(prod.items);
					setTotal(prod.total);
				} else {
					setProducts(prod);
					setTotal(null);
				}
			}
			setLoading(false);
		};

		productFetch();

	}, [page, pageSize])

	async function getProducts(page = 1, pageSize = null) {
		try {
			let url = `/api/music-limited`;
			if (pageSize) {
				url += `?page=${page}&pageSize=${pageSize}`;
			}
			const response = await axios.get(url);
			return response.data || [];
		} catch (error) {
			console.error("Error fetching products:", error);
		}
	}

	// Handler to update URL search params from the SearchBar
	const handleSearch = (query) => {
		if (query && query.trim()) {
			setSearchParams({ search: query.trim() });
		} else {
			setSearchParams({});
		}
		// go back to first page on new search
		setPage(1);
	};

	const cardsArray = products.map(product => {
					return <PreviewCard key={product.id} music={ product } />
				});

	// Filter products based on search query
	const filteredProducts = products.filter(product => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			product.title?.toLowerCase().includes(query) ||
			product.composer?.toLowerCase().includes(query) ||
			product.genre?.toLowerCase().includes(query) ||
			product.instrumentation?.toLowerCase().includes(query)
		);
	});

	const filteredCardsArray = filteredProducts.map(product => {
		return <PreviewCard key={product.id} music={ product } />
	});

	const totalPages = total ? Math.max(1, Math.ceil(total / pageSize)) : null;

	const goPrev = () => {
		setPage(p => Math.max(1, p - 1));
	}

	const goNext = () => {
		if (totalPages) setPage(p => Math.min(totalPages, p + 1));
		else setPage(p => p + 1);
	}

	return (
		<div className="flex flex-col min-h-screen">
			<SearchBar onSearch={handleSearch} />
			<div className='m-4'></div>
			{ searchQuery && (
				<div className="text-center py-4">
					<h2 className="text-xl font-semibold">Search Results for "{searchQuery}"</h2>
					<p className="text-gray-600">{filteredProducts.length} results found</p>
				</div>
			)}
			{ loading ? (
				<p className="text-center py-8">Loading...</p>
			) : (
				(filteredCardsArray.length > 0 ? filteredCardsArray : <p className="text-gray-500 text-center py-8">No products available</p>)
			)}

			{/* Pagination controls */}
			<div className="flex justify-center items-center space-x-4 py-6">
				<button onClick={goPrev} disabled={page === 1} className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50">Previous</button>
				<span className="text-sm">Page {page}{ totalPages ? ` of ${totalPages}` : '' }</span>
				<button onClick={goNext} disabled={totalPages ? page >= totalPages : false} className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50">Next</button>
			</div>

		</div>
	)
}