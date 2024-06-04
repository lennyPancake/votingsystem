import React from "react";
import { Container } from "react-bootstrap";
import { Navbar, Image } from "react-bootstrap";
import { Link, redirect } from "react-router-dom";
//import "./Navbb.css";
import { useLocation } from "react-router-dom";
const linkStyle = {
  textDecoration: "none",
  color: "red",
  flexDirection: "column",
};

const Navb = () => {
  let id = undefined;
  if (sessionStorage.getItem("mainUser")) {
    id = JSON.parse(sessionStorage.getItem("mainUser")).id;
  }
  const location = useLocation();
  const hideNavbar = ["/register", "/login"].includes(location.pathname);
  const isNavLinkActive = (path) => {
    return location.pathname === path ? "active-link" : "";
  };
  if (hideNavbar) {
    return null;
  }
  return (
    <div
      style={{
        width: "300px",
        textAlign: "center",
        height: "100vh",
        position: "fixed",
        borderRight: "1px gray solid",
        paddingTop: "50px",
        marginRight: "100px",
      }}
      className="bg-212529"
    >
      {/* <Image
        style={{ width: "250px", marginBottom: "20px" }}
        src={`${process.env.REACT_APP_BASE_URL}/images/logo.jpg`}
        rounded
      /> */}
      <Navbar style={{ marginTop: "25" }} className="bg-212529">
        <Container className="bg-212529">
          <Link to="/posts" style={linkStyle}>
            <Navbar.Brand
              className={`bg-212529 mx-auto ${isNavLinkActive("/posts")}`}
            >
              Все посты
            </Navbar.Brand>
          </Link>
        </Container>
      </Navbar>
      <br />
      <Navbar className="bg-212529">
        <Container className="bg-212529">
          <Link to={`/users/${id}`} className="my-blog-link" style={linkStyle}>
            <Navbar.Brand
              className={`bg-212529 mx-auto ${isNavLinkActive(`/users/${id}`)}`}
            >
              Мой блог
            </Navbar.Brand>
          </Link>
        </Container>
      </Navbar>
      <br />
      <Navbar className="bg-212529">
        <Container className="bg-212529">
          <Link to="/users" className="all-blogs-link" style={linkStyle}>
            <Navbar.Brand
              className={`bg-212529 mx-auto ${isNavLinkActive("/users")}`}
            >
              Все блоги
            </Navbar.Brand>
          </Link>
        </Container>
      </Navbar>
      <br />
      <Navbar className=""></Navbar>
    </div>
  );
};

export default Navb;
