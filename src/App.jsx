import { useEffect, useState } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import ProductCard from './components/ProductCard';
import { loadProducts } from './utils/loadProducts';
import './App.css';

const App = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    loadProducts().then(data => {
      console.log("Products loaded:", data.length);
      console.log("First product:", data[0]);

      setProducts(data);
    });
  },[]);

  const handleBarcode = (barcode) => {
    console.log("Scanned barcode:", barcode);

    const found = products.find(
      p => String(p.Barcode) === String(barcode)
    );

    console.log("Found product:", found);

    setProduct(found || null);
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>SAS</h1>
      </header>

      <div className="scanner">
        <BarcodeScanner onDetected={handleBarcode}/>
      </div>

      <div className="manual-input">
        <input
          placeholder="Enter barcode"
          onKeyDown={(e) => {
            if(e.key === "Enter") {
              handleBarcode(e.target.value);
            }
          }}
        />
      </div>

      {product && <ProductCard product={product} />}
    </div>
  );
}

export default App