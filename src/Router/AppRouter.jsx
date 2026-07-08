import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";

function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRouter;