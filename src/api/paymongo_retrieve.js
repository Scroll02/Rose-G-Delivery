import axios from "axios";
const retrieveCheckoutSession = async (checkoutSessionId) => {
  const options = {
    method: "GET",
    url: `https://api.paymongo.com/v1/checkout_sessions/${checkoutSessionId}`,
    headers: {
      accept: "application/json",
      authorization: "Basic c2tfdGVzdF9pMVk0M25EeFZ5akRDTmFEdzc5NkhQaHg6",
    },
  };

  try {
    const response = await axios.request(options);
    console.log("Retrieve Checkout Session: ", response.data);
  } catch (error) {
    console.error("Retrieve Checkout Session Error: ", error.response.data);
  }
};

export default retrieveCheckoutSession;
