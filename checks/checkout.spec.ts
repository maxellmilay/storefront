import { expect, test } from "./automata/fixtures";

test(
  "a customer is told to choose an address, then places the order",
  { annotation: [{ type: "act", description: "POST /api/orders" }] },
  async ({ screen }) => {
    const page = await screen("a customer");
    const placed = () =>
      page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).pathname === "/api/orders",
      );
    await test.step("put a product in the cart", async () => {
      await page.goto("/products/prod-notebook");
      await page.getByRole("button", { name: "Add to cart" }).click();
      await expect(page.getByRole("status")).toContainText(
        "Added to your cart.",
      );
      await page.goto("/checkout");
      await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    });
    await test.step("place the order with no address", async () => {
      const refused = placed();
      await page.getByRole("button", { name: "Place order" }).click();
      expect((await refused).status()).toBe(400);
      await expect(page.getByRole("alert")).toContainText("Shipping address:");
    });
    await test.step("POST /api/orders", async () => {
      await page.getByRole("radio", { name: /12 Harbour Road/ }).check();
      const accepted = placed();
      await page.getByRole("button", { name: "Place order" }).click();
      expect((await accepted).status()).toBe(201);
      await expect(page.getByRole("heading", { name: /^Order / })).toBeVisible();
      await expect(page.getByText("Status: PENDING")).toBeVisible();
    });
  },
);
