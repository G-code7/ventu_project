import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { useAuth } from "./modules/Auth/authContext";

import PageLayout from "./modules/Layout/pageLayout";
import HomePage from "./modules/Home/homePage";
import ProfilePage from "./modules/Profile/profilePage";
import ProtectedRoute from "./modules/Auth/protectedRoute";
import EditPackagePage from "./modules/Dashboard/editPackagePage";
import CreatePackagePage from "./modules/Dashboard/createPackagePage";
import TourDetailPage from "./modules/Tours/tourDetailPage";
import AuthLoader from "./modules/Auth/authLoader";

function AppContent() {
  const { user, authTokens } = useAuth();

  console.log("🎯 App - Estado actual:", {
    user,
    tieneToken: !!authTokens,
    token: authTokens ? "Presente" : "Ausente",
  });

  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="me" element={<ProfilePage />} />
          <Route
            path="operator/create-package"
            element={<CreatePackagePage />}
          />
          <Route
            path="operator/edit-package/:packageId"
            element={<EditPackagePage />}
          />
        </Route>
        <Route path="/tour/:tourId" element={<TourDetailPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthLoader>
      <AppContent />
    </AuthLoader>
  );
}

export default App;
