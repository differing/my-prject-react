import { Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";
import CatalogPage from "./CatalogPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import CreatePage from "./CreatePage";
import DecoratePage from "./DecoratePage";
import EditPage from "./EditPage";
import DetailsPage from "./DetailsPage";
import ProfilePage from "./ProfilePage";
import SearchPage from "./SearchPage";
import Page404 from "./Page404";
import Page403 from "./Page403";
import EditProfilePage from "./EditProfilePage"; // 👈 Новият импорт

import AuthGuard from "./guards/AuthGuard";

const Main = () => {
  return (
    <main>
      <Routes>
        {/* 🆓 Публични маршрути */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/details/:id" element={<DetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* ✅ Директно Decorate */}
        <Route path="/decorate/:id" element={<DecoratePage />} />

        {/* 🔐 Само за логнати потребители */}
        <Route element={<AuthGuard />}>
          <Route path="/create" element={<CreatePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} /> {/* ✅ Добавено */}
          <Route path="/details/:id/edit" element={<EditPage />} />
          <Route path="/details/:id/decorate" element={<DecoratePage />} />
        </Route>

        {/* 🚫 Грешки */}
        <Route path="/403" element={<Page403 />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </main>
  );
};

export default Main;
