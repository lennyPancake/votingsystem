import React from "react";
import {
  handleSignMessage,
  useMetaMask,
  quitWallet,
} from "../../hooks/useMetaMask";
import { formatAddress } from "../../utils";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Spinner } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import { Link, redirect } from "react-router-dom";
import "../Navigation/Navigation.module.css"; // Предполагаем, что стили подключены здесь
import NavDropdown from "react-bootstrap/NavDropdown";
import { Dropdown } from "react-bootstrap";
const Navigation = () => {
  const { wallet, hasProvider, isSigning, isConnecting, connectMetaMask } =
    useMetaMask();
  const customColor = {
    backgroundColor: "rgb(39, 39, 39)",
  };
  const linkStyle = {
    textDecoration: "none",
    color: "white",
    flexDirection: "column",
  };
  return (
    <Navbar className="p-3" style={customColor}>
      <Container>
        <Nav className="me-auto">
          <Nav.Link className="text-white">
            <Link to="/home" style={linkStyle}>
              Главная страница
            </Link>
          </Nav.Link>
          <NavDropdown
            menuVariant="dark"
            title={
              <span className="text-light my-auto">Список голосований</span>
            }
          >
            <Dropdown.Item>
              <Link to="/voting" style={linkStyle}>
                Активные голосования
              </Link>
            </Dropdown.Item>
            <NavDropdown.Item>
              <Link to="/inactive" style={linkStyle}>
                Неактивные голосования
              </Link>
            </NavDropdown.Item>
          </NavDropdown>

          <Nav.Link className="text-white">
            <Link to="/create" style={linkStyle}>
              Создать голосование
            </Link>
          </Nav.Link>
        </Nav>
        <div className="auth col-auto">
          {!hasProvider && (
            <a href="https://metamask.io" target="_blank" rel="noreferrer">
              Install MetaMask
            </a>
          )}
          {!isConnecting && hasProvider && wallet.accounts.length > 0 && (
            <button className="me-3" type="button" onClick={quitWallet}>
              Disconnect from DApp
            </button>
          )}
          {(isConnecting ||
            isSigning ||
            (hasProvider && wallet.accounts.length === 0)) && (
            <button
              className="me-3"
              disabled={isConnecting || isSigning}
              onClick={connectMetaMask}
            >
              {!isSigning && !isConnecting ? (
                <>Connect MetaMask</>
              ) : (
                <>
                  <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              )}
            </button>
          )}
          {hasProvider && wallet.accounts.length > 0 && !isConnecting && (
            <a
              className="text_link tooltip-bottom me-5"
              href={`https://etherscan.io/address/${wallet.accounts[0]}`}
              target="_blank"
              data-tooltip="Open in Block Explorer"
              rel="noreferrer"
            >
              {formatAddress(wallet.accounts[0])}
            </a>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default Navigation;
