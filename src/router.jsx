// src/router.jsx

import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

const router = createBrowserRouter([
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/auth/logout", element: <AuthCallback logout /> },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <ChatPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;