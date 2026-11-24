import { createBrowserRouter } from "react-router";
import { Layout } from "../layouts/Layout";
import { Admin } from "../pages/Admin";
import { AdminLoans } from "../pages/AdminLoans";
import { Entrance } from "../pages/Entrance";
import { MyLoans } from "../pages/MyLoans";
import { Notices } from "../pages/Notices";
import { BookDetail } from "../pages/BookDetail";
import { Careers } from "../pages/Careers";
import { Home } from "../pages/Home";
import { ForgotPassword } from "../pages/ForgotPassword";
import { Login } from "../pages/Login";
import { NotFound } from "../pages/NotFound";
import { Register } from "../pages/Register";
import { ResetPassword } from "../pages/ResetPassword";
import { Users } from "../pages/Users";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/entrada", element: <Entrance /> },
  { path: "/register", element: <Register /> },
  { path: "/recuperar", element: <ForgotPassword /> },
  { path: "/restablecer", element: <ResetPassword /> },
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "carreras", element: <Careers /> },
      { path: "libros/:id", element: <BookDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "alquilados", element: <MyLoans /> },
          { path: "mis-prestamos", element: <MyLoans /> },
          { path: "avisos", element: <Notices /> },
        ],
      },
      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [
          {
            path: "admin",
            children: [
              { index: true, element: <Admin /> },
              { path: "prestamos", element: <AdminLoans /> },
              { path: "usuarios", element: <Users /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
