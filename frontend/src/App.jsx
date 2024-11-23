import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../public/css/style.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "./constant/pathnames";
import User from "./Pages/User/User";
import Customer from "./Pages/Customer/Customer";
import Project from "./Pages/Project/Project";
import Remaind from "./Pages/Remaind/Remaind";
import Payment from "./Pages/Payment/Payment";
import HomeLayout from "./layout/HomeLayout";
import SuKien from "./Pages/SuKien/SuKien";
import Login from "./Pages/Login/Login";
import AddUser from "./Pages/User/AddUser";
import EditUser from "./Pages/User/EditUser";
import Home from "./Pages/Home";
import AddCustomer from "./Pages/Customer/AddCustomer";
import EditCustomer from "./Pages/Customer/EditCustomer";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path={PATHS.LOGIN}
          element={<Login onLogin={handleLogin} />}
        />

        {/* Admin Routes (Protected) */}
        <Route
          path={PATHS.HOME}
          element={
            isLoggedIn ? (
              <HomeLayout onLogout={handleLogout} />
            ) : (
              <Navigate to={PATHS.LOGIN} replace />
            )
          }
        >
          <Route index element={<Home />} />
          {/* ----------------USER------------------------- */}
          <Route path={PATHS.USER} element={<User />} />
          <Route path={PATHS.ADD_USER} element={<AddUser />} />
          <Route path={`${PATHS.EDIT_USER}/:id`} element={<EditUser />} />

          {/* ----------------CUSTOMER------------------------- */}
          <Route path={PATHS.CUSTOMER} element={<Customer />} />
          <Route path={PATHS.ADD_CUSTOMER} element={<AddCustomer />} />
          <Route path={`${PATHS.EDIT_CUSTOMER}/:id`} element={<EditCustomer />} />








          <Route path={PATHS.PROJECT} element={<Project />} />
          <Route path={PATHS.EVENT} element={<SuKien />} />
          <Route path={PATHS.REMAIND} element={<Remaind />} />
          <Route path={PATHS.PAYMENT} element={<Payment />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

