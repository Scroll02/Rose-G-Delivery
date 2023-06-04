import React, { useState, useEffect } from "react";
import MenuProductCard from "../components/UI/MenuProductCard";
import { Container, Row, Col } from "reactstrap";
import "../style/Menu.css";
import { useLocation } from "react-router-dom";
import TitlePageBanner from "../components/UI/TitlePageBanner";
import { CustomPrevArrow, CustomNextArrow } from "../globals/Slider";
import Slider from "react-slick";

// Firebase
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const Menu = () => {
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

  //------------------ Retrieve Product Categories Data ------------------//
  const [productCategoriesData, setProductCategoriesData] = useState([]);
  useEffect(() => {
    //LISTEN (REALTIME)
    const unsub = onSnapshot(
      collection(db, "ProductCategories"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProductCategoriesData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);
  // console.log(productCategoriesData);

  // Navigation
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categories = params.get("category");

  //------------------ Category Buttons Function (Filter) ------------------//
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories || "All");
  const [allProducts, setAllProducts] = useState(productData);
  const [label, setLabel] = useState("All");
  useEffect(() => {
    if (category === "All") {
      setAllProducts(productData);
      setLabel("All");
    } else {
      const filteredProducts = productData.filter(
        (item) => item.categoryName === category
      );
      setAllProducts(filteredProducts);
      setLabel(category);
    }
  }, [category, productData]);

  //------------------ Categories Slider Settings ------------------//
  const settings = {
    className: "categoriesBtn__slides",
    speed: 500,
    infinite: false,
    slidesToShow: 5,
    slidesToScroll: 5,
    arrows: true,
    prevArrow: <CustomPrevArrow arrowSize={25} />,
    nextArrow: <CustomNextArrow arrowSize={25} />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
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
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: false,
        },
      },
    ],
  };

  return (
    <div>
      <Container>
        {/*------------------ Category Buttons ------------------*/}
        <Row>
          <div className="slider__header-title mt-5">
            <h5>Menu Categories</h5>
            <p>
              You selected category <span>"{label}"</span>
            </p>
          </div>
        </Row>

        <Slider {...settings}>
          <div className="slides__item">
            <button
              className="category__btn"
              onClick={() => setCategory("All")}
            >
              All
            </button>
          </div>

          {productCategoriesData.map((category) => {
            return (
              <div className="slides__item" key={category.productCategoryId}>
                <button
                  className={`category__btn ${
                    category.categoryName === categories ? "active" : ""
                  }`}
                  onClick={() => setCategory(category.categoryName)}
                >
                  {category.categoryName}
                </button>
              </div>
            );
          })}
        </Slider>

        {/*------------------ Display Food ------------------*/}
        <section>
          <Row>
            {allProducts
              .filter((post) => {
                if (query === "") {
                  return post;
                } else if (
                  post.title.toLowerCase().includes(query.toLowerCase()) ||
                  post.category.toLowerCase().includes(query.toLowerCase())
                ) {
                  return post;
                }
              })
              .map((item) => (
                <Col lg="4" md="6" sm="6" xs="6" key={item.id}>
                  <MenuProductCard item={item} />
                </Col>
              ))}
          </Row>
        </section>
      </Container>
    </div>
  );
};

export default Menu;
