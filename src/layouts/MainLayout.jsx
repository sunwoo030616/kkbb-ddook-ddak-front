// src/layouts/MainLayout.jsx

import { useSyncExternalStore } from "react";
import { getAuth, subscribeAuth } from "../lib/auth.js";
import { Outlet } from "react-router-dom";
import Header from "../components/common/Header.jsx";

function MainLayout() {
  const { user, ready } = useSyncExternalStore(subscribeAuth, getAuth);
  const sessionOwner = user ? JSON.stringify([user.profile.iss, user.profile.sub]) : "guest";
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} authReady={ready} />
      <main className="px-4 py-6">
        {ready && <Outlet key={sessionOwner} context={sessionOwner} />}
      </main>
    </div>
  );
}

export default MainLayout;