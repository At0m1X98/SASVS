import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
const scannerRef = useRef(null);
const containerRef = useRef(null);
const startedRef = useRef(false);

useEffect(() => {
let scanner;

const startScanner = async () => {
try {
if (!containerRef.current) return;
if (startedRef.current) return; // prevent double start
startedRef.current = true;

scanner = new Html5Qrcode(containerRef.current.id);    
scannerRef.current = scanner;    

const cameras = await Html5Qrcode.getCameras();    

if (!cameras || cameras.length === 0) {    
  console.error("No camera found");    
  return;    
}    

const backCamera =    
cameras.find(c =>    
	c.label.toLowerCase().includes("back") ||    
	c.label.toLowerCase().includes("rear") ||    
	c.label.toLowerCase().includes("environment")    
) || cameras[cameras.length - 1];    

const cameraId = backCamera.id;    

await scanner.start(    
{ deviceId: cameraId },    
{

fps: 15,
qrbox: (viewfinderWidth, viewfinderHeight) => ({
width: Math.min(viewfinderWidth * 0.5, 250),
height: Math.min(viewfinderHeight * 0.2, 50),
}),
aspectRatio: 1.3,
},
(decodedText) => {
onDetected(decodedText);
},
() => {}
);
} catch (err) {
console.error("Scanner start error:", err);
}
};

// IMPORTANT: run after paint
requestAnimationFrame(() => {
startScanner();
});

return () => {
startedRef.current = false;

if (scannerRef.current) {
try {
scannerRef.current.stop().then(() => {
scannerRef.current.clear();
});
} catch (e) {
// ignore cleanup errors
}
}
};

}, [onDetected]);

return (

<div  
ref={containerRef}  
id="barcode-scanner"  
style={{  
width: "100%",  
maxWidth: "400px",  
minHeight: "300px",  
borderRadius: "12px",  
overflow: "hidden",  
background: "#000",  
}}  
/>  
);  
};  export default BarcodeScanner;
