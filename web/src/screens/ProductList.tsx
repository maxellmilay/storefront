import { useState } from "react";
import { Link } from "react-router";
import { errorOf, price } from "../api/client";
import { useCategories, useProducts } from "../api/hooks";

export function ProductList() {
  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const products = useProducts(q, categoryId);
  const categories = useCategories();

  return (
    <>
      <h1>Products</h1>
      <div className="filters">
        <label>
          Search products{" "}
          <input
            type="search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </label>
        <label>
          Category{" "}
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {products.isPending && <p>Loading products…</p>}
      {products.isError && <p role="alert">{errorOf(products.error)}</p>}
      {products.data?.length === 0 && <p>No products match.</p>}
      <ul className="products">
        {products.data?.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
            <span>{price(product.priceCents)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
