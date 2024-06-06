import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMetaMask } from "../hooks/useMetaMask";
import Login from "../pages/Login";

const withAuth = (Component) => () => {
  const { wallet, isConnecting, connectMetaMask } = useMetaMask();
  const navigate = useNavigate();
  if (!wallet.accounts.length) {
    return <Login />;
  }

  return <Component />;
};

export default withAuth;
