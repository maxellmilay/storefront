import { useState } from "react";
import { Link } from "react-router";
import { errorOf, price } from "../api/client";
import {
  useApplyCoupon,
  useCart,
  useRemoveCoupon,
  useRemoveFromCart,
  useSetQuantity,
} from "../api/hooks";
import { Totals } from "./Totals";

export function Cart() {
  const cart = useCart();
  const setQuantity = useSetQuantity();
  const remove = useRemoveFromCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState("");

  if (cart.isPending) return <p>Loading your cart…</p>;
  if (cart.isError) {
    return (
      <p role="alert">
        {errorOf(cart.error)} <Link to="/sign-in">Sign in</Link>
      </p>
    );
  }
  const { items, coupon } = cart.data;
  const error =
    setQuantity.error ?? remove.error ?? applyCoupon.error ?? removeCoupon.error;

  return (
    <>
      <h1>Your cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="lines">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>{price(item.unitPriceCents)}</span>
              <label>
                Quantity of {item.name}{" "}
                <input
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                  onBlur={(event) => {
                    const quantity = Number(event.target.value);
                    if (quantity !== item.quantity) {
                      setQuantity.mutate({ itemId: item.id, quantity });
                    }
                  }}
                />
              </label>
              <button type="button" onClick={() => remove.mutate(item.id)}>
                Remove {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {coupon === null ? (
        <form
          className="coupon"
          onSubmit={(event) => {
            event.preventDefault();
            applyCoupon.mutate(code);
          }}
        >
          <label>
            Coupon code{" "}
            <input value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
          <button type="submit" disabled={applyCoupon.isPending}>
            Apply coupon
          </button>
        </form>
      ) : (
        <p className="coupon">
          Coupon {coupon} applied.{" "}
          <button type="button" onClick={() => removeCoupon.mutate()}>
            Remove coupon
          </button>
        </p>
      )}

      <Totals {...cart.data} />
      {error !== null && <p role="alert">{errorOf(error)}</p>}
      {items.length > 0 && (
        <Link to="/checkout" className="button">
          Go to checkout
        </Link>
      )}
    </>
  );
}
