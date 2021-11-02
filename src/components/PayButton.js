import React from "react";
import StripeCheckout from "react-stripe-checkout";
// import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_gJgNpW1KQNGR4DQGcH0v5jZO",
};

const PayButton = ({ product, user }) => {
  return (
    <StripeCheckout
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shippingAddress}
      locale="auto"
      allowRememberMe="false"
    />
  );
};

export default PayButton;
