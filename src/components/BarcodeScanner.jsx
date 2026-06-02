import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("barcode-scanner");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // rear camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            console.log("Detected:", decodedText);
            onDetected?.(decodedText);
          },
          () => {
            // ignore scan errors
          }
        );

        console.log("Scanner started");
      } catch (err) {
        console.error("Failed to start scanner:", err);

        // Fallback to first available camera
        try {
          const cameras = await Html5Qrcode.getCameras();

          if (!mounted || !cameras.length) {
            return;
          }

          console.log("Available cameras:", cameras);

          const scanner = scannerRef.current;

          await scanner.start(
            cameras[0].id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              console.log("Detected:", decodedText);
              onDetected?.(decodedText);
            },
            () => {}
          );
        } catch (fallbackErr) {
          console.error("Fallback camera failed:", fallbackErr);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;

      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div
      id="barcode-scanner"
      style={{
        width: "100%",
        maxWidth: "400px",
        height: "350px",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    />
  );
};

export default BarcodeScanner;