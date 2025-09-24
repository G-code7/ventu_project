import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

import { useAuth } from "./modules/Auth/authContext";
import Header from "./modules/Layout/header";
import Footer from "./modules/Layout/footer";
import Hero from "./modules/Home/hero";
import FeaturedDestinations from "./modules/Home/featuredDestinations";
import Section from "./modules/Layout/section";
import TourCard from "./modules/Tours/tourCard";
import RegisterModal from "./modules/Auth/registerModal";
import LoginModal from "./modules/Auth/loginModal";

import PageLayout from "./modules/Layout/pageLayout";
import HomePage from "./modules/Home/homePage";
import ProfilePage from "./modules/Profile/profilePage";
import CreatePackagePage from "./modules/Dashboard/createPackagePage";
import ProtectedRoute from "./modules/Auth/protectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        {/* Rutas Públicas: accesibles para todos */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas Protegidas: solo para usuarios autenticados */}
        <Route element={<ProtectedRoute />}>
          <Route path="me" element={<ProfilePage />} />
          <Route
            path="operator/create-package"
            element={<CreatePackagePage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;