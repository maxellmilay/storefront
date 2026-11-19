import { expect, test } from "./automata/fixtures";

test(
  "a customer adds a product to the cart, sees the totals and removes it",
  { annotation: [{ type: "act", description: "POST /api/cart/items" }] },
  async ({ screen }) => {
    const page = await screen("another customer");
    await test.step("open the product from the list", async () => {
      await page.goto("/");
      await page.getByRole("link", { name: "Enamel mug" }).click();
      await expect(
        page.getByRole("heading", { name: "Enamel mug" }),
      ).toBeVisible();
    });
    await test.step("POST /api/cart/items", async () => {
      const added = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          new URL(response.url()).pathname === "/api/cart/items",
      );
      await page.getByRole("button", { name: "Add to cart" }).click();
      expect((await added).status()).toBe(201);
      await expect(page.getByRole("status")).toContainText(
        "Added to your cart.",
      );
    });
    await test.step("see the cart's totals", async () => {
      await page.getByRole("link", { name: "View cart" }).click();
      await expect(
        page.getByRole("spinbutton", { name: "Quantity of Enamel mug" }),
      ).toHaveValue("1");
      // $18.00, 8% tax, and the flat $5.99 shipping under $50.00.
      const totals = page.getByRole("definition");
      await expect(totals).toHaveText([
        "$18.00",
        "−$0.00",
        "$1.44",
        "$5.99",
        "$25.43",
      ]);
    });
    await test.step("remove the product", async () => {
      await page.getByRole("button", { name: "Remove Enamel mug" }).click();
      await expect(page.getByText("Your cart is empty.")).toBeVisible();
    });
  },
);
