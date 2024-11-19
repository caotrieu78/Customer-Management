import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../public/css/style.css"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { PATHS } from "./constant/pathnames";
import User from "./Pages/User/User";
import Customer from "./Pages/Customer/Customer";
import Project from "./Pages/Project/Project";
import Remaind from "./Pages/Remaind/Remaind";
import Payment from "./Pages/Payment/Payment";
import HomeLayout from "./layout/HomeLayout";
import SuKien from "./Pages/SuKien/SuKien";
// import Login from "./Pages/Login/Login"; // Uncomment if Login component is used in future

function App() {
  // const isLoggedIn = false; // Uncomment and set up for authentication

  return (
    <Router>
      <Routes>
        {/* Uncomment and configure for login redirection */}
        {/* <Route path="/" element={isLoggedIn ? <Navigate to={PATHS.HOME} /> : <Login />} /> */}
        <Route path={PATHS.HOME} element={<HomeLayout />}>
          <Route path={PATHS.USER} element={<User />} />
          <Route path={PATHS.CUSTOMER} element={<Customer />} />
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
