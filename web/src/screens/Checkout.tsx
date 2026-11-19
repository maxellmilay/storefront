import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { errorOf, fieldErrorOf } from "../api/client";
import {
  useAddAddress,
  useAddresses,
  useCart,
  usePlaceOrder,
} from "../api/hooks";
import { Totals } from "./Totals";

const ADDRESS_FIELDS = [
  { name: "line1", label: "Address line 1" },
  { name: "line2", label: "Address line 2" },
  { name: "city", label: "City" },
  { name: "postalCode", label: "Postal code" },
  { name: "country", label: "Country code" },
] as const;

export function Checkout() {
  const cart = useCart();
  const addresses = useAddresses();
  const addAddress = useAddAddress();
  const place = usePlaceOrder();
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState("");

  if (cart.isPending || addresses.isPending) return <p>Loading checkout…</p>;
  if (cart.isError) return <p role="alert">{errorOf(cart.error)}</p>;
  if (addresses.isError) return <p role="alert">{errorOf(addresses.error)}</p>;

  function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");
    addAddress.mutate(
      {
        line1: text("line1"),
        line2: text("line2") || undefined,
        city: text("city"),
        postalCode: text("postalCode"),
        country: text("country"),
      },
      { onSuccess: (address) => setAddressId(address.id) },
    );
  }

  // An empty choice is sent as is, so the API's own validation answers it.
  function placeOrder() {
    place.mutate(addressId, {
      onSuccess: (order) => void navigate(`/orders/${order.id}`),
    });
  }

  const addressIdError = fieldErrorOf(place.error, "addressId");

  return (
    <>
      <h1>Checkout</h1>
      <Totals {...cart.data} />

      <fieldset>
        <legend>Shipping address</legend>
        {addresses.data.length === 0 && <p>You have no saved addresses.</p>}
        {addresses.data.map((address) => (
          <label key={address.id} className="choice">
            <input
              type="radio"
              name="addressId"
              value={address.id}
              checked={addressId === address.id}
              onChange={() => setAddressId(address.id)}
            />
            {address.line1}, {address.city} {address.postalCode},{" "}
            {address.country}
          </label>
        ))}
      </fieldset>

      <details>
        <summary>Add a new address</summary>
        <form onSubmit={submitAddress} noValidate>
          {ADDRESS_FIELDS.map((field) => {
            const message = fieldErrorOf(addAddress.error, field.name);
            return (
              <label key={field.name}>
                {field.label}{" "}
                <input name={field.name} aria-invalid={message !== null} />
                {message !== null && (
                  <span role="alert" className="field-error">
                    {field.label}: {message}
                  </span>
                )}
              </label>
            );
          })}
          <button type="submit" disabled={addAddress.isPending}>
            Save address
          </button>
          {addAddress.isError && (
            <p role="alert">{errorOf(addAddress.error)}</p>
          )}
        </form>
      </details>

      <button type="button" onClick={placeOrder} disabled={place.isPending}>
        Place order
      </button>
      {place.isError && (
        <p role="alert">
          {addressIdError !== null
            ? `Shipping address: ${addressIdError}`
            : errorOf(place.error)}
        </p>
      )}
    </>
  );
}
