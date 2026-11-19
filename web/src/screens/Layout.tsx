import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useNavigate } from "react-router";
import { saveToken } from "../api/client";
import { useAccount } from "../api/hooks";
import "../styles.css";

export function Layout() {
  const account = useAccount();
  const client = useQueryClient();
  const navigate = useNavigate();
  const user = account.data ?? null;

  function signOut() {
    saveToken(null);
    client.clear();
    void navigate("/");
  }

  return (
    <>
      <header>
        <nav aria-label="Main">
          <Link to="/" className="brand">
            Storefront
          </Link>
          <Link to="/">Products</Link>
          {user === null ? (
            <Link to="/sign-in">Sign in</Link>
          ) : (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">Orders</Link>
              <span className="who">Signed in as {user.name}</span>
              <button type="button" onClick={signOut}>
                Sign out
              </button>
            </>
          )}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
