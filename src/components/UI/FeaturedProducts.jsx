import React, { useState, useEffect } from "react";
import "../../style/FeaturedProducts.css";
import Slider from "react-slick";
import { Col } from "reactstrap";
import ProductCard from "./ProductCard";

// Firebase
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";

const FeaturedProducts = () => {
  //------------------ Retrieve Food Data ------------------//
  const [productData, setProductData] = useState([]);
  useEffect(() => {
    //LISTEN (REALTIME)
    const unsub = onSnapshot(
      collection(db, "ProductData"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProductData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  //------------------ Featured Products Slider ------------------//
  const ArrowLeft = (props) => (
    <button
      {...props}
      className={"ftProdPrev__btn ri-arrow-left-circle-fill"}
    />
  );
  const ArrowRight = (props) => (
    <button
      {...props}
      className={"ftProdNext__btn ri-arrow-right-circle-fill"}
    />
  );
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    arrows: true,
    prevArrow: <ArrowLeft />,
    nextArrow: <ArrowRight />,
    className: "featuredProduct__slides",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="ftProd__container">
      <h4>Featured Product</h4>
      <h6>Discover your new favorites here!</h6>
      <Slider {...settings}>
        {productData.map((item) => (
          <div className="ftProduct__item">
            <Col lg="3" key={item.productId}>
              <ProductCard item={item} />
            </Col>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedProducts;
