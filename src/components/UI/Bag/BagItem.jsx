import React, { useState, useEffect } from "react";
import { ListGroupItem } from "reactstrap";
import "../../../style/Bag-Item.css";
// Firebase
import { auth, db } from "../../../firebase";
import { deleteDoc, getDoc, updateDoc, doc } from "firebase/firestore";
// Redux
import { useDispatch, useSelector } from "react-redux";
import { bagActions } from "../../../store/MyBag/bagSlice";
import { fetchBagItems } from "../../../store/MyBag/bagSlice";

const BagItem = ({ item }) => {
  const { productId, productName, price, img, productQty, totalPrice } = item;

  const dispatch = useDispatch();

  const bagItems = useSelector((state) => state.bag.bagItems);

  useEffect(() => {
    dispatch(fetchBagItems(auth.currentUser.uid)); //retrieve user's bag items
  }, [dispatch]);

  //------------------ Increment Item Function ------------------//
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputQuantity, setInputQuantity] = useState(productQty.toString());

  //------------------ Update Item Quantity Function ------------------//
  const updateItemQuantity = async (newQuantity) => {
    if (isUpdating) {
      return;
    }
    setIsUpdating(true);

    const parsedQuantity = parseInt(newQuantity, 10); // Parse the string as an integer

    const userBagRef = doc(db, "UserBag", auth.currentUser.uid);
    const userBagData = await getDoc(userBagRef);

    const updatedBag = userBagData.data().bag.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          productQty: parsedQuantity,
          totalPrice: Number(item.price) * parsedQuantity,
        };
      } else {
        return item;
      }
    });

    await updateDoc(userBagRef, {
      bag: updatedBag,
    });

    setIsUpdating(false);

    dispatch(
      bagActions.updateItemQuantity({
        productId: productId,
        newQuantity: parsedQuantity,
      })
    );
  };

  const handleInputChange = (e) => {
    const newQuantity = e.target.value;
    setInputQuantity(newQuantity);
    if (newQuantity.trim() === "") {
      updateItemQuantity(1); // Set default value if the input is empty
    } else {
      updateItemQuantity(newQuantity);
    }
  };

  const incrementItem = async () => {
    if (isUpdating) {
      return;
    }
    setIsUpdating(true);

    const userBagRef = doc(db, "UserBag", auth.currentUser.uid);
    const userBagData = await getDoc(userBagRef);

    const updatedBag = userBagData.data().bag.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          productQty: item.productQty + 1,
          totalPrice: Number(item.totalPrice) + Number(item.price),
        };
      } else {
        return item;
      }
    });
    await updateDoc(userBagRef, {
      bag: updatedBag,
    });

    setIsUpdating(false);

    // responsible for the data to reflect on the website
    dispatch(
      bagActions.addItem({
        productId: productId,
        productName,
        price,
        img,
        productQty: productQty + 1,
        totalPrice: totalPrice + price,
      })
    );
  };

  //------------------ Decrement Item Function ------------------//
  const decrementItem = async () => {
    if (isUpdating) {
      return;
    }
    setIsUpdating(true);

    const userBagRef = doc(db, "UserBag", auth.currentUser.uid);
    const userBagData = await getDoc(userBagRef);

    const updatedBag = userBagData
      .data()
      .bag.map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            productQty: item.productQty - 1,
            totalPrice: Number(item.totalPrice) - Number(item.price),
          };
        } else {
          return item;
        }
      })
      .filter((item) => item.productQty && item.productQty > 0);

    if (updatedBag.length > 0) {
      await updateDoc(userBagRef, {
        bag: updatedBag,
      });
    } else {
      await deleteDoc(userBagRef);
    }

    setIsUpdating(false);

    dispatch(bagActions.removeItem(productId));
  };

  //------------------ Delete Item Function ------------------//
  const deleteItem = async () => {
    const userBagRef = doc(db, "UserBag", auth.currentUser.uid);
    const userBagData = await getDoc(userBagRef);

    const updatedBag = userBagData
      .data()
      .bag.filter((item) => item.productId !== productId);

    await updateDoc(userBagRef, {
      bag: updatedBag,
    });

    dispatch(bagActions.deleteItem(productId));
  };

  return (
    <ListGroupItem className="border-0 bag__item">
      <div className="bag__item-info d-flex gap-2" key={item.productId}>
        {/* Product Image */}
        <img src={item.img} alt="Product Image" />

        <div className="bag__product-info w-100 d-flex align-items-center gap-5 justify-content-between">
          <div>
            {/* Product Name */}
            <h6 className="bag__product-title">{item.productName}</h6>
            <p className="d-flex align-items-center gap-5">
              <div className="d-flex align-items-center gap-2 increase__decrease-btn">
                {/* Increase Button */}
                <span className="increase__btn" onClick={incrementItem}>
                  <i class="ri-add-circle-fill"></i>
                </span>

                {/* Product Quantity */}
                {/* <input
                  type="number"
                  min="1"
                  value={inputQuantity}
                  onChange={handleInputChange}
                  className="bagQuantity__input"
                /> */}

                {/* Product Quantity */}
                <span className="quantity__title">{productQty}</span>

                {/* Decrease Button */}
                <span className="decrease__btn" onClick={decrementItem}>
                  <i class="ri-indeterminate-circle-fill"></i>
                </span>
              </div>

              {/* Product Price * Product Quantity */}
              <span className="bag__product-price">
                ₱{" "}
                {parseFloat(price * productQty)
                  .toFixed(2)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </p>
          </div>

          {/* Delete Button */}
          <span className="delete__btn" onClick={deleteItem}>
            <i class="ri-delete-bin-line"></i>
          </span>
        </div>
      </div>
    </ListGroupItem>
  );
};

export default BagItem;
