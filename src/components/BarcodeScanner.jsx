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

        const backCamera =
          cameras.find(
            (c) =>
              c.label.toLowerCase().includes("back") ||
              c.label.toLowerCase().includes("rear") ||
              c.label.toLowerCase().includes("environment")
          ) || cameras[cameras.length - 1];

        const cameraId = backCamera.id;

        await scanner.start(
          {
            deviceId: { exact: cameraId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "environment",
          },
          {
            fps: 30,
            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.min(viewfinderWidth * 0.8, 500),
              height: Math.min(viewfinderHeight * 0.3, 150),
            }),
            aspectRatio: 16 / 9,
            disableFlip: true,
          },
          (decodedText) => {
            onDetected(decodedText);
          },
          () => {
            // Ignore scan failures
          }
        );

        // Log actual camera resolution
        setTimeout(() => {
          const video = document.querySelector(
            `#${containerRef.current.id} video`
          );

          if (video) {
            console.log(
              `Camera resolution: ${video.videoWidth} x ${video.videoHeight}`
            );
          }
        }, 1000);
      } catch (err) {
        console.error("Scanner start error:", err);
        startedRef.current = false;
      }
    };

    requestAnimationFrame(() => {
      startScanner();
    });

    return () => {
      startedRef.current = false;

      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {
            // ignore cleanup errors
          });
      }
    };
  }, [onDetected]);

  return (
    <div
      ref={containerRef}
      id="barcode-scanner"
      style={{
        width: "100%",
        maxWidth: "500px",
        minHeight: "350px",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#000",
      }}
    />
  );
};

export default BarcodeScanner;