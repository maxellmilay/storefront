import { Link } from "react-router";
import { errorOf, price } from "../api/client";
import { useOrders } from "../api/hooks";

export function Orders() {
  const orders = useOrders();
  if (orders.isPending) return <p>Loading your orders…</p>;
  if (orders.isError) return <p role="alert">{errorOf(orders.error)}</p>;

  return (
    <>
      <h1>Your orders</h1>
      {orders.data.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Placed</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.data.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link to={`/orders/${order.id}`}>Order {order.id}</Link>
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>{price(order.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
