import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import List from "./pages/ActiveList";
import Create from "./pages/Create";
import Voting from "./pages/Voting";
import Navigation from "./components/Navigation/Navigation"; // Импортируем Navigation
import { MetaMaskError } from "./components/MetamaskError";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./pages/Home";
import { Navigate } from "react-router-dom";
import InActiveList from "./pages/InActiveList";
import ActiveList from "./pages/ActiveList";

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/voting" element={<ActiveList />} />
        <Route path="/voting/:id" element={<Voting />} />
        <Route path="/inactive" element={<InActiveList />} />
        <Route path="/*" element={<Navigate to="/home" replace />} />
      </Routes>
      <MetaMaskError />
    </BrowserRouter>
  );
}

export default App;
