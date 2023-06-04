import React, { useState, useEffect } from "react";
import "../../style/FeaturedProducts.css";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import { CustomNextArrow, CustomPrevArrow } from "../../globals/Slider";

// Firebase
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";

const FeaturedProducts = () => {
  //------------------ Retrieve Food Data ------------------//
  const [productData, setProductData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const salesReportsRef = collection(db, "SalesReports");
      const salesReportsSnapshot = await getDocs(salesReportsRef);

      let productTotals = {};
      let products = [];

      salesReportsSnapshot.forEach((doc) => {
        const data = JSON.parse(doc.data().data); // Parse the data field

        // Calculate totalSold for each product
        data.forEach((product) => {
          if (
            product &&
            product.productId &&
            !isNaN(parseFloat(product.totalSold))
          ) {
            const productId = product.productId;
            const totalSold = parseFloat(product.totalSold); // Parse totalSold as a number

            if (productTotals.hasOwnProperty(productId)) {
              productTotals[productId] += totalSold;
            } else {
              productTotals[productId] = totalSold;
            }

            // Store the product object
            products.push(product);
          }
        });
      });

      // Sort products based on totalSold in descending order
      const sortedProducts = Object.keys(productTotals).sort(
        (a, b) => productTotals[b] - productTotals[a]
      );

      // Get the top 10 products with the highest totalSold
      const topProducts = sortedProducts.slice(0, 10);

      // Retrieve the product objects for the top products
      const bestSellingProducts = topProducts.map((productId) =>
        products.find((product) => product.productId === productId)
      );

      setProductData(bestSellingProducts);
    };

    fetchData();
  }, []);

  //------------------ Featured Products Slider ------------------//
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    arrows: true,
    prevArrow: <CustomPrevArrow arrowSize={40} />,
    nextArrow: <CustomNextArrow arrowSize={40} />,
    className: "featuredProduct__slides",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
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
          <div className="ftProduct__item" key={item.productId}>
            <ProductCard item={item} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedProducts;
