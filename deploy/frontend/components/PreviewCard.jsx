import {useState} from 'react';

function PreviewCard({ _title, _composer, _arranger, _pdfFile, _mp3File }) {
	const [title, setTitle] = useState(_title || "Untitled");
	const [composer, setComposer] = useState(_composer || "Unknown Composer");
	const [arranger, setArranger] = useState(_arranger || "");
	const [pdfFile, setPdfFile] = useState(_pdfFile || null);
	const [mp3File, setMp3File] = useState(_mp3File || null);

	  return (
		<div>
			

			<a href="#" className="flex flex-col items-center bg-white p-6 border border-default rounded-base shadow-xs md:flex-row ">
				<img className="object-cover w-full rounded-base h-64 md:h-auto md:w-48 mb-4 md:mb-0" src="../testAssets/bannanabread.jpg" alt="Test Image" />
				<div className="flex flex-col justify-between md:p-4 leading-normal">
					<div>
						<h5 className="text-xl font-bold tracking-tight text-gray-900">{title}</h5>
						<p className="text-sm text-gray-600">by {composer}</p>
						{arranger && <p className="text-sm text-gray-600">arranged by {arranger}</p>}
					</div>
				</div>
			</a>


		</div>
	)
}

export default PreviewCard;