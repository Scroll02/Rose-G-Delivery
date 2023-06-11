import React, { useEffect, useState } from "react";
import "../../style/MenuProductCard.css";
// Navigation
import { Link, useNavigate } from "react-router-dom";
// Redux
import { useDispatch } from "react-redux";
import { bagActions } from "../../store/MyBag/bagSlice";
// Firebase
import { db, auth } from "../../firebase";
import { getDoc, setDoc, arrayUnion, updateDoc, doc } from "firebase/firestore";
// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../Toast/Toast";
// Modal
import AvailabilityModal from "../Modal/AvailabilityModal";

const MenuProductCard = (props) => {
  const {
    id,
    productName,
    img,
    description,
    price,
    currentStock,
    initialStock,
  } = props.item;

  // Modal
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const closeAvalabilityModal = () => {
    setShowAvailabilityModal(false);
  };

  // Add to Cart Function
  const dispatch = useDispatch();
  const addToCart = async () => {
    if (!auth.currentUser) {
      showErrorToast("You need to login first", 2000);
      return;
    }

    const newItem = {
      productId: id,
      productName: productName,
      img: img,
      price: price,
      productQty: 1,
    };

    // Check if the product name contains "Palabok" and "pax"
    const isLimitedProduct =
      productName.includes("Palabok") && productName.includes("pax");
    let limitExceeded = false;

    if (isLimitedProduct && newItem.productQty > 10) {
      limitExceeded = true;
    }

    const docRef = doc(db, "UserBag", auth.currentUser.uid);

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const bagItems = docSnap.data().bag;
        const itemExists = bagItems.some(
          (item) => item.productId === newItem.productId
        );

        if (itemExists) {
          showInfoToast("The item is already in the cart", 2000);
          return;
        }
      }

      // Retrieve currentStock and initialStock from Firestore
      const productDataRef = doc(db, "ProductData", id);
      const productDataSnap = await getDoc(productDataRef);

      if (productDataSnap.exists()) {
        const productData = productDataSnap.data();
        const currentStock = productData.currentStock;
        const initialStock = productData.initialStock;

        // Check if productQty exceeds the limit or the currentStock
        if (
          limitExceeded ||
          newItem.productQty > currentStock ||
          newItem.productQty > initialStock
        ) {
          setShowAvailabilityModal(true);
          return;
        }
      }

      dispatch(bagActions.addItem(newItem));
      const totalPrice = price * 1;

      // Add item to Firebase
      const data1 = {
        ...newItem,
        totalPrice: totalPrice,
      };

      // Update or create document
      const updatePromise = docSnap.exists()
        ? updateDoc(docRef, { bag: arrayUnion(data1) })
        : setDoc(docRef, { bag: [data1] });

      await updatePromise;
      showSuccessToast("Item added to cart", 2000);
    } catch (error) {
      showErrorToast(`Item is not added to cart: ${error}`, 2000);
    }
  };

  return (
    <>
      {showAvailabilityModal && (
        <AvailabilityModal closeAvalabilityModal={closeAvalabilityModal} />
      )}
      <div className="menu__productCards">
        <div className="menu__singleProduct">
          <div className="menu__productImg">
            <Link to={`/productDetails/${id}`}>
              <img
                src={img}
                alt="product-image"
                className={`product-img ${productName.replace(/\s+/g, "")}`}
              />
            </Link>
          </div>
          <div className="menu__productContent">
            <h6>
              <Link to={`/productDetails/${id}`}>{productName}</Link>
            </h6>

            <p className="menu__productDesc">{description}</p>

            <div className="menu__productFooter">
              <span className="menu__productPrice">
                <span class="menu__productPrice">
                  ₱
                  {parseFloat(price)
                    .toFixed(2)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </span>

              {/* Add to Bag button */}
              {currentStock === 0 || initialStock === 0 ? (
                <button className="menu__orderBtn" disabled>
                  <label>Out of stock</label>
                </button>
              ) : (
                <button className="menu__orderBtn" onClick={addToCart}>
                  <i class="ri-shopping-cart-2-line"></i>
                  <span>+</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuProductCard;
