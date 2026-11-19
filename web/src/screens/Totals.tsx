import { price } from "../api/client";

interface Props {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

/** The price breakdown the API computes, as a labelled list. */
export function Totals(props: Props) {
  return (
    <dl className="totals" aria-label="Totals">
      <dt>Subtotal</dt>
      <dd>{price(props.subtotalCents)}</dd>
      <dt>Discount</dt>
      <dd>−{price(props.discountCents)}</dd>
      <dt>Tax</dt>
      <dd>{price(props.taxCents)}</dd>
      <dt>Shipping</dt>
      <dd>{price(props.shippingCents)}</dd>
      <dt>Total</dt>
      <dd>{price(props.totalCents)}</dd>
    </dl>
  );
}
