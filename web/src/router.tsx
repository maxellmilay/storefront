import { createBrowserRouter } from "react-router";
import { Cart } from "./screens/Cart";
import { Checkout } from "./screens/Checkout";
import { Layout } from "./screens/Layout";
import { OrderDetail } from "./screens/OrderDetail";
import { Orders } from "./screens/Orders";
import { ProductDetail } from "./screens/ProductDetail";
import { ProductList } from "./screens/ProductList";
import { SignIn } from "./screens/SignIn";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <ProductList /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "sign-in", element: <SignIn /> },
      { path: "orders", element: <Orders /> },
      { path: "orders/:id", element: <OrderDetail /> },
    ],
  },
]);
