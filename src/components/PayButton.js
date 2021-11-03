import React from "react";
import { API } from "aws-amplify";
import StripeCheckout from "react-stripe-checkout";
// import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_gJgNpW1KQNGR4DQGcH0v5jZO",
};

const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    console.log(token);
    try {
      const result = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
          },
        },
      });
      console.log({ result });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shippingAddress}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
