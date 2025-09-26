import React from "react";
import { Routes, Route } from "react-router-dom";

import PageLayout from "./modules/Layout/pageLayout";
import HomePage from "./modules/Home/homePage";
import ProfilePage from "./modules/Profile/profilePage";
import ProtectedRoute from "./modules/Auth/protectedRoute";
import EditPackagePage from "./modules/Dashboard/editPackagePage";
import CreatePackagePage from "./modules/Dashboard/createPackagePage";

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
          <Route
            path="operator/edit-package/:packageId"
            element={<EditPackagePage />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;