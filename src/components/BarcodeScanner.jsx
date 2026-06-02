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

        await scanner.start(
          { facingMode: "environment" }, // ✅ FORCE BACK CAMERA
          {
            fps: 5,
            qrbox: { width: 140, height: 120 },
            aspectRatio: 1.0,

            videoConstraints: {
              facingMode: { exact: "environment" }, // 🔥 critical fix

              width: { ideal: 1920 },
              height: { ideal: 1080 },

              focusMode: "continuous",
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

    requestAnimationFrame(startScanner);

    return () => {
      startedRef.current = false;

      if (scannerRef.current) {
        scannerRef.current.stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
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