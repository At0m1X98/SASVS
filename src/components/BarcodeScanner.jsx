Perfect, this works but the camera is front one not the main on the back of the phone.

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
    if (startedRef.current) return;  
    startedRef.current = true;  

    scanner = new Html5Qrcode(containerRef.current.id);  
    scannerRef.current = scanner;  

    const cameras = await Html5Qrcode.getCameras();  

    if (!cameras || cameras.length === 0) {  
      console.error("No camera found");  
      return;  
    }  

    // Prefer back camera  
    const backCamera =  
      cameras.find((c) =>  
        c.label.toLowerCase().includes("back") ||  
        c.label.toLowerCase().includes("rear") ||  
        c.label.toLowerCase().includes("environment")  
      ) || cameras[cameras.length - 1];  

    const cameraId = backCamera.id;  

    await scanner.start(  
      cameraId,  
      {  
        fps: 5,  

        // IMPORTANT: smaller scan area for tiny barcodes  
        qrbox: { width: 140, height: 120 },  

        aspectRatio: 1.0,  

        videoConstraints: {  
          width: { ideal: 1920 },  
          height: { ideal: 1080 },  

          // autofocus improvements  
          focusMode: "continuous",  
          advanced: [{ focusMode: "continuous" }],  

          // zoom helps a LOT for small barcodes (may not work on all devices)  
          advanced: [{ zoom: 2 }],  
        },  
      },  
      (decodedText) => {  
        if (decodedText) {  
          onDetected(decodedText);  
        }  
      },  
      (errorMessage) => {  
        // silent scan errors (normal)  
      }  
    );  
  } catch (err) {  
    console.error("Scanner start error:", err);  
  }  
};  

requestAnimationFrame(() => {  
  startScanner();  
});  

return () => {  
  startedRef.current = false;  

  if (scannerRef.current) {  
    try {  
      scannerRef.current  
        .stop()  
        .then(() => {  
          scannerRef.current.clear();  
        })  
        .catch(() => {});  
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
};

export default BarcodeScanner;