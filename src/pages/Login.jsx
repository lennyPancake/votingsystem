import React from "react";
import style from "./Login.module.css";
import { useMetaMask } from "../hooks/useMetaMask";
const Login = () => {
  const { wallet, isConnecting, connectMetaMask } = useMetaMask();
  return (
    <div className={style.main}>
      {" "}
      <header>
        <h1>Добро пожаловать в систему электронных голосований на блокчейне</h1>
      </header>
      <main>
        {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
          <section>
            <h2>Авторизация</h2>
            <p>
              Для того чтобы проголосовать, пожалуйста, авторизуйтесь в системе
              через MetaMask.
            </p>
            <button onClick={connectMetaMask} id="connect">
              Подключить MetaMask
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Login;
