import { useParams } from "react-router";
import { errorOf, price } from "../api/client";
import { useCancelOrder, useOrder } from "../api/hooks";
import { Totals } from "./Totals";

export function OrderDetail() {
  const { id = "" } = useParams();
  const order = useOrder(id);
  const cancel = useCancelOrder(id);

  if (order.isPending) return <p>Loading the order…</p>;
  if (order.isError) return <p role="alert">{errorOf(order.error)}</p>;
  const { status, shippingAddress: to, items = [] } = order.data;

  return (
    <>
      <h1>Order {order.data.id}</h1>
      <p>
        Status: <strong>{status}</strong>
      </p>
      <p>
        Ships to {to.line1}, {to.city} {to.postalCode}, {to.country}
      </p>
      <ul className="lines">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span>× {item.quantity}</span>
            <span>{price(item.unitPriceCents * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <Totals {...order.data} />
      {status === "PENDING" && (
        <button
          type="button"
          disabled={cancel.isPending}
          onClick={() => cancel.mutate()}
        >
          Cancel order
        </button>
      )}
      {cancel.isSuccess && <p role="status">Your order is cancelled.</p>}
      {cancel.isError && <p role="alert">{errorOf(cancel.error)}</p>}
    </>
  );
}
