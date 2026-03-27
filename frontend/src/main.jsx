import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Home from "./components/Home.jsx";
import DisCover from "./components/Discover.jsx";
import Categories from "./components/Categories.jsx";
import About from "./components/About.jsx";
import Profile from "./components/Profile.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import Newpost from "./components/Newpost.jsx";
import Postpage from "./components/Postpage.jsx";
import NotFoundPage from "./components/Notfound.jsx";
import OthersProfile from "./components/Otherprofile.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Boda from "./components/Boda.jsx";
import BlogEditor from "./components/Updateblog.jsx";
import ProtectedRoute from "./components/Protect.jsx";
import { UserProvider } from "../context/usercontext.jsx";
import LoginPrompt from "./components/back.jsx";
import AfterPost from "./components/afterPost.jsx";
import GlobalErrorBoundary from "./components/ErrorBoundary.jsx";
import Publications from "./components/Publications.jsx";
import PublicationPage from "./components/PublicationPage.jsx";
import CreatePublication from "./components/CreatePublication.jsx";
import PublicationDashboard from "./components/PublicationDashboard.jsx";
import MyPublicationsPage from "./components/MyPublicationsPage.jsx";
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/discover/:catagory",

        element: <DisCover />,
      },
      {
        path: "/catagories",
        element: <Categories />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/newpost/",
        element: (
          <ProtectedRoute>
            <Newpost />
          </ProtectedRoute>
        ),
      },
      {
        path: "/detail/:slug",
        element: <Postpage />,
      },

      { path: "/other/:id", element: <OthersProfile /> },
      { path: "*", element: <NotFoundPage /> },
      {
        path: "/edit/:slug",
        element: (
          <ProtectedRoute>
            <BlogEditor />
          </ProtectedRoute>
        ),
      },
      { path: "/prompt", element: <LoginPrompt /> },
      { path: "/after", element: <AfterPost /> },
      // ── Publications ──────────────────────────────────────────────
      { path: "/publications", element: <Publications /> },
      { path: "/publication/:id", element: <PublicationPage /> },
      {
        path: "/publications/create",
        element: (
          <ProtectedRoute>
            <CreatePublication />
          </ProtectedRoute>
        ),
      },
      {
        path: "/publication/:id/edit",
        element: (
          <ProtectedRoute>
            <CreatePublication />
          </ProtectedRoute>
        ),
      },
      {
        path: "/publication/:id/dashboard",
        element: (
          <ProtectedRoute>
            <PublicationDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-publications",
        element: (
          <ProtectedRoute>
            <MyPublicationsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);
