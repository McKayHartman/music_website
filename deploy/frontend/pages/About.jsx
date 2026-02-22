import React from 'react'
import profilePic from '../assets/DSC_7271.jpeg'

function About() {
	return (
		<div className="py-12 px-4">
			<div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/60 p-8 rounded-lg shadow-lg">
				<h1 className="text-3xl md:text-4xl font-extrabold mb-6">About Annelise Hartman</h1>
				<div className='flex flex-col md:flex-row gap-6 items-start'>
					<img
						src={profilePic}
						alt="Annelise Hartman"
						className="w-40 md:w-56 lg:w-64 flex-shrink-0 rounded-lg object-cover"
						loading="lazy"
					/>

					<div className="md:flex-1">
						<p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
							Annelise "Annie" Hartman is a passionate performer, composer, and dedicated music educator whose work reflects both artistry and heart. She studied piano for sixteen years, graduating in 2022 from Level 12 of the Arizona Study Program through the Arizona State Music Teachers Association with all superior ratings. She continued her musical studies at the University of Arizona School of Music, pursuing a Bachelor's degree in Music Education while studying piano performance under Dr. Rie Tanaka.
							Though piano remains her primary instrument, Annie is also an accomplished violinist and singer, and she actively cultivates her voice as a composer and arranger. In 2024 and 2025, her choral arrangments of L, How a Rose E'er Blooming and Carol of the Bells were premiered by the University Singers, reflecting her growing presence as a choral writer.
							Annie belives deeply in the transformative power of music and feels called to teach. Many of her compositions are written with her students and ensambles in mind, serving both artistic and pedagogical purposes. For Annie, music is life-giving, and her mission is to share its beauty, discipline, and joy with her community in every way she can.

						</p>
					</div>
				</div>
				<div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
					</div>
					<div className="flex gap-3">
						<a href="/music" className="inline-block px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">Browse Music</a>
						<a href="/contact" className="inline-block px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50">Contact</a>
					</div>
				</div>
			</div>
		</div>
	)
}

export default About