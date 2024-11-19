import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path={PATHS.LOGIN}
          element={<Login onLogin={() => setIsLoggedIn(true)} />}
        />

        {/* Admin Routes (Protected) */}
        <Route
          path={PATHS.HOME}
          element={
            isLoggedIn ? (
              <HomeLayout />
            ) : (
              <Navigate to={PATHS.LOGIN} replace />
            )
          }
        >
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
