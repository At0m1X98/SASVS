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
      if (startedRef.current) return;

      try {
        startedRef.current = true;

        const scanner = new Html5Qrcode("barcode-scanner");
        scannerRef.current = scanner;

        const formatsToSupport = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const config = {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          formatsToSupport,
        };

        try {
          // Preferred approach on mobile
          await scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              if (decodedText) {
                onDetected(decodedText);
              }
            },
            () => {}
          );

          console.log("Started using environment camera");
          return;
        } catch (err) {
          console.warn(
            "Environment camera failed, trying camera list...",
            err
          );
        }

        // Fallback: choose rear camera manually
        const cameras = await Html5Qrcode.getCameras();

        if (!cameras?.length) {
          throw new Error("No cameras found");
        }

        console.log("Available cameras:", cameras);

        const backCamera =
          cameras.find((camera) => {
            const label = camera.label.toLowerCase();

            return (
              label.includes("back") ||
              label.includes("rear") ||
              label.includes("environment")
            );
          }) || cameras[cameras.length - 1];

        await scanner.start(
          backCamera.id,
          config,
          (decodedText) => {
            if (decodedText) {
              onDetected(decodedText);
            }
          },
          () => {}
        );

        console.log("Started using:", backCamera.label);
      } catch (error) {
        console.error("Scanner start error:", error);

        if (isMounted) {
          startedRef.current = false;
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      startedRef.current = false;

      const scanner = scannerRef.current;

      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
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
        minHeight: "300px",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#000",
      }}
    />
  );
};

export default BarcodeScanner;