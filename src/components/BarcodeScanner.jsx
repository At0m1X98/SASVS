import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const BarcodeScanner = ({ onDetected }) => {
	const videoRef = useRef();

	useEffect(() => {
		const reader = new BrowserMultiFormatReader();

		reader.decodeFromVideoDevice(
			undefined,
			videoRef.current,
			(result) => {
				if(result) {
					onDetected(result.getText());
				}
			}
		);

		return () => {
			if(reader?.stop) {
				reader.stop();
			}
		};
	}, []);

	return (
		<video
			ref={videoRef}
			style={{
				width: '100%',
				maxWidth: '400px'
			}}
		/>
	)
}

export default BarcodeScanner;