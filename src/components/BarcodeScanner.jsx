import { useEffect, useRef } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

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

        if (!cameras?.length) {
          console.error("No camera found");
          return;
        }

        const backCamera =
          cameras.find(
            (camera) =>
              camera.label.toLowerCase().includes("back") ||
              camera.label.toLowerCase().includes("rear") ||
              camera.label.toLowerCase().includes("environment")
          ) || cameras[cameras.length - 1];

        await scanner.start(
          {
            deviceId: backCamera.id,
          },
          {
            fps: 10,

            qrbox: (viewfinderWidth, viewfinderHeight) => ({
              width: Math.min(viewfinderWidth * 0.8, 500),
              height: Math.min(viewfinderHeight * 0.4, 200),
            }),

            aspectRatio: 1.777,

            videoConstraints: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: "environment",
            },

            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ],
          },
          (decodedText) => {
            onDetected(decodedText);
          },
          () => {
            // Ignore scan failures
          }
        );

        // Try enabling autofocus if supported
        try {
          const videoTrack = scanner
            .getState
            ? null
            : null;

          const videoElement =
            containerRef.current.querySelector("video");

          const mediaStream =
            videoElement?.srcObject;

          const track = mediaStream
            ?.getVideoTracks?.()[0];

          if (track) {
            const capabilities =
              track.getCapabilities?.();

            if (
              capabilities &&
              capabilities.focusMode
            ) {
              await track.applyConstraints({
                advanced: [
                  {
                    focusMode: "continuous",
                  },
                ],
              });
            }
          }
        } catch (focusError) {
          console.warn(
            "Autofocus not supported:",
            focusError
          );
        }
      } catch (err) {
        console.error("Scanner start error:", err);
        startedRef.current = false;
      }
    };

    const rafId = requestAnimationFrame(startScanner);

    return () => {
      cancelAnimationFrame(rafId);
      startedRef.current = false;

      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch(() => {
            // Ignore cleanup errors
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