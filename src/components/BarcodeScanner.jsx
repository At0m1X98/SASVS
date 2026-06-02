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

        // Strong back-camera selection
        const backCamera =
          cameras.find((c) => {
            const label = c.label.toLowerCase();
            return (
              label.includes("back") ||
              label.includes("rear") ||
              label.includes("environment") ||
              label.includes("0") // many Android devices put back camera first
            );
          }) || cameras[0];

        const cameraId = backCamera.id;

        await scanner.start(
          cameraId, // ✅ IMPORTANT: only this controls camera
          {
            fps: 5,
            qrbox: { width: 140, height: 120 },
            aspectRatio: 1.0,

            // ❌ REMOVE facingMode completely

            videoConstraints: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },

              focusMode: "continuous",

              // zoom helps small barcodes (if supported)
              advanced: [{ zoom: 2 }],
            },
          },
          (decodedText) => {
            if (decodedText) onDetected(decodedText);
          },
          () => {}
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
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
          });
        } catch (e) {
          // ignore
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