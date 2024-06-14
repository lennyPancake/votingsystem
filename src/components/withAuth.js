import React from "react";
import { useMetaMask } from "../hooks/useMetaMask";
import Login from "../pages/Login";

const withAuth = (Component) => () => {
  const { wallet } = useMetaMask();
  if (!wallet.accounts.length) {
    return <Login />;
  }

  return <Component />;
};

export default withAuth;
