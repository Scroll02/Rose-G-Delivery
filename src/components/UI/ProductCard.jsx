import React from "react";
import "../../style/ProductCard.css";

// Navigation
import { Link } from "react-router-dom";

const ProductCard = (props) => {
  const { id, productName, img, price } = props.item;
  return (
    <div className="product__card">
      <div className="single__product">
        <div className="product__img">
          <img src={img} alt="image01" />
        </div>
        <div className="product__content">
          <h6>
            <Link to={`/productDetails/${id}`}>{productName}</Link>
          </h6>
          <div className="productCard__footer">
            <span className="product__price">
              <span>₱{parseFloat(price).toFixed(2)}</span>
            </span>
            <Link to={`/productDetails/${id}`}>
              <button className="order__btn">Order</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
