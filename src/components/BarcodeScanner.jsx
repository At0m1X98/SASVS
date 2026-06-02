import { useEffect, useRef } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        if (startedRef.current) return;

        startedRef.current = true;

        const scanner = new Html5Qrcode("barcode-scanner");
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();

        if (!cameras?.length) {
          console.error("No cameras found");
          return;
        }

        console.log("Available cameras:", cameras);

        const backCamera =
          cameras.find((camera) => {
            const label = camera.label.toLowerCase();

            return (
              label.includes("back") ||
              label.includes("rear") ||
              label.includes("environment") ||
              label.includes("main")
            );
          }) || cameras[cameras.length - 1];

        await scanner.start(
          {
            deviceId: { exact: backCamera.id },
          },
          {
            fps: 15,

            // Better for barcodes than a huge scan box
            qrbox: (viewfinderWidth) => ({
              width: Math.min(viewfinderWidth * 0.85, 320),
              height: 140,
            }),

            aspectRatio: 16 / 9,

            videoConstraints: {
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },

            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
            ],
          },
          (decodedText) => {
            if (!isMounted) return;

            console.log("Detected:", decodedText);
            onDetected(decodedText);
          },
          () => {
            // ignore scan failures
          }
        );

        // Attempt continuous autofocus if supported
        const video = document.querySelector(
          "#barcode-scanner video"
        );

        if (video?.srcObject) {
          const track = video.srcObject.getVideoTracks()[0];

          const capabilities = track.getCapabilities?.();

          if (
            capabilities &&
            capabilities.focusMode?.includes("continuous")
          ) {
            try {
              await track.applyConstraints({
                advanced: [
                  {
                    focusMode: "continuous",
                  },
                ],
              });
            } catch (err) {
              console.warn("Continuous focus not supported:", err);
            }
          }
        }
      } catch (err) {
        console.error("Scanner start error:", err);
      }
    };

    requestAnimationFrame(startScanner);

    return () => {
      isMounted = false;
      startedRef.current = false;

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
        height: "75vh",
        minHeight: "500px",
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};

export default BarcodeScanner;