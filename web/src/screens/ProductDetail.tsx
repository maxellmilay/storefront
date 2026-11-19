import { useState } from "react";
import { Link, useParams } from "react-router";
import { errorOf, price } from "../api/client";
import { useAddToCart, useProduct } from "../api/hooks";

export function ProductDetail() {
  const { id = "" } = useParams();
  const product = useProduct(id);
  const add = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  if (product.isPending) return <p>Loading…</p>;
  if (product.isError) return <p role="alert">{errorOf(product.error)}</p>;
  const { name, description, priceCents, stock } = product.data;

  return (
    <>
      <h1>{name}</h1>
      {description !== null && <p>{description}</p>}
      <p className="price">{price(priceCents)}</p>
      <p>{stock > 0 ? `${stock} in stock` : "Out of stock"}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          add.mutate({ productId: id, quantity });
        }}
      >
        <label>
          Quantity{" "}
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>
        <button type="submit" disabled={add.isPending}>
          Add to cart
        </button>
      </form>
      {add.isSuccess && (
        <p role="status">
          Added to your cart. <Link to="/cart">View cart</Link>
        </p>
      )}
      {add.isError && <p role="alert">{errorOf(add.error)}</p>}
    </>
  );
}
