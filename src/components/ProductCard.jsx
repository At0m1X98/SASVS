import "../App.css";

const ProductCard = ({ product }) => {
  return (
    <div className="card">

      {/* Header */}
      <div className="card-title">
        {product.Partnumber}
      </div>

      {/* Price + Stock */}
      <div className="price-row">
        <span className="price">
           <span className="old-price">
				{product["Current Price"]} Kč
			</span>
			{" "}→{" "}
			<span className="new-price">
				{product["SAS price"]} Kč
			</span>
        </span>

        <span className="stock">
          {product["CHODOV STOCK Fillezilla"] ?? "No stock info"}
        </span>
      </div>

      {/* Key info grid */}
      <div className="grid">
        <div>
          <div className="label">Division</div>
          <div className="value">{product.division}</div>
        </div>

        <div>
          <div className="label">Subbrand</div>
          <div className="value">{product.SUBBRAND}</div>
        </div>

        <div>
          <div className="label">Form</div>
          <div className="value">{product.form}</div>
        </div>

        <div>
          <div className="label">Color</div>
          <div className="value">{product["Color Description"]}</div>
        </div>
      </div>

      {/* Description */}
      <div className="desc">
        {product["Story Description"]}
      </div>

    </div>
  );
};

export default ProductCard;