import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const fetchBagItems = createAsyncThunk(
  "bag/fetchBagItems",
  async (userId) => {
    const userBagRef = doc(db, "UserBag", userId);
    const userBagDoc = await getDoc(userBagRef);
    if (userBagDoc.exists()) {
      const bagItems = userBagDoc.data().bag;
      const totalQuantity = bagItems.length; // count the number of items in the bag

      // Fetch delivery fee
      let deliveryFee = 0;
      const deliveryFeeRef = doc(db, "DeliveryFee", "deliveryFee");
      const deliveryFeeDoc = await getDoc(deliveryFeeRef);
      if (deliveryFeeDoc.exists()) {
        const deliveryFeeData = deliveryFeeDoc.data();
        if (deliveryFeeData && deliveryFeeData.value) {
          deliveryFee = deliveryFeeData.value;
        }
      }

      return { bagItems, totalQuantity, deliveryFee };
    }
    return initialState;
  }
);

const initialState = {
  bagItems: [],
  totalQuantity: 0, // use for the bag badge, the number of each food item in the bag
  subTotalAmount: 0,
  totalAmount: 0,
  deliveryFee: 0,
};

const bagSlice = createSlice({
  name: "bag",
  initialState: initialState,

  reducers: {
    //------------------ Add Item ------------------//
    addItem(state, action) {
      const newItem = action.payload;

      const existingItemIndex = state.bagItems.findIndex(
        (item) => item.productId === newItem.productId
      );

      if (existingItemIndex === -1) {
        state.bagItems.push({
          productId: newItem.productId,
          productName: newItem.productName,
          img: newItem.img,
          price: newItem.price,
          productQty: newItem.productQty,
          totalPrice: newItem.totalPrice,
        });
        // if the item added is not existing, +1 on the bag badge
        state.totalQuantity++;
      } else {
        const existingItem = state.bagItems[existingItemIndex];
        existingItem.productQty++;
        existingItem.totalPrice =
          Number(existingItem.totalPrice) + Number(newItem.price);
      }

      state.subTotalAmount = state.bagItems.reduce(
        (subTotal, item) =>
          subTotal + Number(item.price) * Number(item.productQty),
        0
      );

      state.totalAmount = state.subTotalAmount + state.deliveryFee;
    },

    //------------------ Remove Item ------------------//
    removeItem(state, action) {
      const itemToRemove = action.payload;

      const existingItem = state.bagItems.find(
        (item) => item.productId === itemToRemove
      );

      if (existingItem) {
        if (existingItem.productQty === 1) {
          state.bagItems = state.bagItems.filter(
            (item) => item.productId !== itemToRemove
          );
          // if the  existing item is remove or reaches the foodQty to 0, then -1 on the bag badge
          state.totalQuantity--;
        } else {
          existingItem.productQty--;
          existingItem.totalPrice =
            Number(existingItem.totalPrice) - Number(existingItem.price);
        }
      }

      state.subTotalAmount = state.bagItems.reduce(
        (subTotal, item) =>
          subTotal + Number(item.price) * Number(item.productQty),
        0
      );

      state.totalAmount = state.subTotalAmount + state.deliveryFee;
    },

    //------------------ Delete Item ------------------//
    deleteItem(state, action) {
      const itemToDelete = action.payload;

      const existingItem = state.bagItems.find(
        (item) => item.productId === itemToDelete
      );

      if (existingItem) {
        state.bagItems = state.bagItems.filter(
          (item) => item.productId !== itemToDelete
        );
        // if the  existing item is deleted, then -1 on the bag badge
        state.totalQuantity--;
      }

      state.subTotalAmount = state.bagItems.reduce(
        (subTotal, item) =>
          subTotal + Number(item.price) * Number(item.productQty),
        0
      );

      state.totalAmount = state.subTotalAmount + state.deliveryFee;
    },

    setBagItems(state, action) {
      state.bagItems = action.payload;
    },

    resetTotalQuantity(state) {
      state.totalQuantity = 0;
    },
  },

  // extraReducers: (builder) => {
  //   builder.addCase(fetchBagItems.fulfilled, (state, action) => {
  //     state.bagItems = action.payload.bagItems;
  //     state.totalQuantity = action.payload.totalQuantity;
  //     state.subTotalAmount = state.bagItems.reduce(
  //       (subTotal, item) =>
  //         subTotal + Number(item.price) * Number(item.productQty),
  //       0
  //     );

  //     const deliveryFee = action.payload.deliveryFee;
  //     state.totalAmount =
  //       state.bagItems.reduce(
  //         (total, item) => total + Number(item.price) * Number(item.productQty),
  //         0
  //       ) + deliveryFee;
  //   });
  // },
  extraReducers: (builder) => {
    builder.addCase(fetchBagItems.fulfilled, (state, action) => {
      state.bagItems = action.payload.bagItems;
      state.totalQuantity = action.payload.totalQuantity;

      const subTotalAmount = state.bagItems.reduce(
        (subTotal, item) =>
          subTotal + (Number(item.price) || 0) * (Number(item.productQty) || 0),
        0
      );
      state.subTotalAmount = subTotalAmount;

      state.deliveryFee = action.payload.deliveryFee || 0;
      state.totalAmount = state.subTotalAmount + state.deliveryFee;
    });
  },
});

export const bagReducer = bagSlice.reducer;
// export const bagActions = bagSlice.actions;
export const bagActions = {
  ...bagSlice.actions,
  fetchBagItems,
};
export default bagSlice;
