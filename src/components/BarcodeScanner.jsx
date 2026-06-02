import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode("barcode-scanner");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          onDetected?.(decodedText);
        }
      )
      .catch((err) => {
        console.error("START ERROR:", err);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
      startedRef.current = false;
    };
  }, [onDetected]);

  return (
  <div
    id="barcode-scanner"
    style={{
      width: "100%",
      maxWidth: "400px",
      height: "250px",
      overflow: "hidden",
      borderRadius: "12px",
      margin: "0 auto",
    }}
  />
);
};

export default BarcodeScanner;