import React, { useState, useEffect } from "react";
import "../style/ProductDetails.css";
import { Container, Row, Col } from "reactstrap";
import ExtrasProductList from "../components/UI/ExtrasProductList";

// Navigation
import { useParams, useNavigate } from "react-router-dom";

// Redux
import { useDispatch } from "react-redux";
import { bagActions } from "../store/MyBag/bagSlice";

// Icons or Images
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";

// Connect Firebase
import { getDoc, setDoc, arrayUnion, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase.js";

// Toast
import { showSuccessToast, showErrorToast } from "../components/Toast/Toast";

const ProductDetails = () => {
  //------------------ Get Document ID of the selected food ------------------//
  const { id } = useParams();
  // console.log(id);

  //------------------ Navigation ------------------//
  const navigate = useNavigate();

  //------------------ Retrieve Food Data ------------------//
  const [productData, setProductData] = useState();

  const getProductData = async () => {
    const docRef = doc(db, "ProductData", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log("Document data: ", docSnap.data());
      setProductData(docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    getProductData();
  }, [id]);

  // Food Quantity
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  //------------------ Add to Bag Function ------------------//
  const dispatch = useDispatch();
  // Firebase
  const addToBag = () => {
    if (!auth.currentUser) {
      showErrorToast("You need to login first", 2000);
      return;
    }
    dispatch(
      bagActions.addItem({
        productId: id,
        productName: productData?.productName,
        img: productData?.img,
        price: productData?.price,
        productQty: quantity,
      })
    );
    const totalPrice = productData?.price * quantity;

    // Add item to firebase
    const docRef = doc(db, "UserBag", auth.currentUser.uid);
    const data1 = {
      productId: id,
      productName: productData?.productName,
      img: productData?.img,
      price: productData?.price,
      productQty: quantity,
      totalPrice: totalPrice,
    };

    // Check if document exists before updating it
    getDoc(docRef)
      .then((doc) => {
        if (doc.exists()) {
          updateDoc(docRef, {
            bag: arrayUnion(data1),
          })
            .then(() => {
              showSuccessToast("Item added to cart", 2000);
              navigate("/menu");
            })
            .catch((error) => {
              showErrorToast(`Item is not added to cart: ${error}`, 2000);
            });
        } else {
          setDoc(docRef, {
            bag: [data1],
          })
            .then(() => {
              showSuccessToast("Item added to cart", 2000);
              navigate("/menu");
            })
            .catch((error) => {
              showErrorToast(`Item is not added to cart: ${error}`, 2000);
            });
        }
      })
      .catch((error) => {
        showErrorToast(`The data doesn't exist: ${error}`, 1000);
      });
  };

  return (
    <main>
      <Container>
        <Row className="single__product-row mb-5">
          <Col className="container__leftCol" lg="12">
            <Row>
              <Col>
                <div className="foodProduct__image">
                  <img src={productData?.img} alt="product-img" />
                </div>
              </Col>

              <Col className="d-flex align-items-center justify-content-center">
                <div className="single__product-content">
                  <h2 className="foodProduct__title mb-3">
                    {productData?.productName}
                  </h2>
                  <p className="foodProduct__category mb-3 ">
                    <strong>Category:</strong>{" "}
                    <span>{productData?.categoryName}</span>
                  </p>
                  <div className="foodProduct_desc">
                    <h4
                      className="mb-3"
                      style={{ color: "var(--text-color1)" }}
                    >
                      Description:
                    </h4>
                    <p>{productData?.description}</p>
                  </div>

                  <div className="mt-4">
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <p className="foodProduct__price mb-0">
                          <strong>Price:</strong>&nbsp; ₱
                          {parseFloat(productData?.price * quantity)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </p>
                      </Col>
                      <Col xs="auto">
                        <div className="foodProduct__qty">
                          <button
                            className="quantity__btn"
                            onClick={handleDecrease}
                          >
                            <RemoveCircleOutlineOutlinedIcon />
                          </button>
                          <span className="quantity__label">{quantity}</span>
                          <button
                            className="quantity__btn"
                            onClick={handleIncrease}
                          >
                            <AddCircleOutlineOutlinedIcon />
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <button
                    className="foodProduct__addBtn mt-4"
                    onClick={addToBag}
                  >
                    Add to Cart
                  </button>
                </div>
              </Col>
            </Row>
          </Col>

          <Col className="container__rightCol" lg="12">
            <ExtrasProductList categoryName="Extras" title="Add-ons items" />
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default ProductDetails;
