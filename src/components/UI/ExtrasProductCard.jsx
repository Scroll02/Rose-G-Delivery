import React, { useState, useEffect } from "react";
import "../../style/ExtrasProductCard.css";

// Navigation
import { Link, useLocation } from "react-router-dom";

// Connect Firebase
import { db, auth } from "../../firebase";
import { getDoc, setDoc, arrayUnion, updateDoc, doc } from "firebase/firestore";

// Redux
import { useDispatch } from "react-redux";
import { bagActions } from "../../store/MyBag/bagSlice";
// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../Toast/Toast";

const ExtrasProductCard = (props) => {
  const { id, productName, img, price } = props.item;
  const location = useLocation();
  const dispatch = useDispatch();

  const addToBag = () => {
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

    const docRef = doc(db, "UserBag", auth.currentUser.uid);

    getDoc(docRef)
      .then((doc) => {
        if (doc.exists()) {
          const bagItems = doc.data().bag;
          const itemExists = bagItems.some(
            (item) => item.productId === newItem.productId
          );

          if (itemExists) {
            showInfoToast("The item is already in the bag");
            return;
          }
        }

        dispatch(bagActions.addItem(newItem));
        const totalPrice = price * 1;

        // Add item to firebase
        const data1 = {
          ...newItem,
          totalPrice: totalPrice,
        };

        // Update or create document
        const updatePromise = doc.exists()
          ? updateDoc(docRef, { bag: arrayUnion(data1) })
          : setDoc(docRef, { bag: [data1] });

        updatePromise
          .then(() => {
            showSuccessToast("Item added to bag", 1000);
          })
          .catch((error) => {
            showErrorToast(`Item is not added to bag: ${error}`, 1000);
          });
      })
      .catch((error) => {
        // Create document
        setDoc(docRef, { bag: [newItem] })
          .then(() => {
            dispatch(bagActions.addItem(newItem));
            showSuccessToast("Item added to bag", 1000);
          })
          .catch((error) => {
            showErrorToast(`Item is not added to bag: ${error}`, 1000);
          });
      });
  };

  return (
    <div className="extrasProduct__card">
      <div className="single__extrasProduct">
        <div className="extrasProduct__img">
          <Link key={location.pathname} to={`/productDetails/${id}`}>
            <img src={img} alt="product-image" />
          </Link>
        </div>
        <div className="extrasProduct__content">
          <h6>
            <Link key={location.pathname} to={`/productDetails/${id}`}>
              {productName}
            </Link>
          </h6>
          <div className="extrasProductCard__footer">
            <span className="extrasProduct__price">
              <span>₱{parseFloat(price).toFixed(2)}</span>
            </span>

            <button className="extrasProduct__btn" onClick={addToBag}>
              <i class="ri-shopping-cart-2-line"></i>
              <span>+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtrasProductCard;
