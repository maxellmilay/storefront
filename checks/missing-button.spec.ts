import { test } from "./automata/fixtures";

// Fails on purpose: the product page has no "Buy now" button, so the click
// times out and Playwright takes its failure screenshot (beside the video
// every screen records).
test(
  "a shopper buys a product in one click",
  {
    annotation: [
      { type: "harness", description: "fails on purpose" },
      { type: "act", description: "POST /api/orders" },
    ],
  },
  async ({ screen }) => {
    const page = await screen("anonymous");
    await test.step("open the product", async () => {
      await page.goto("/products/prod-mug");
    });
    await test.step("POST /api/orders", async () => {
      await page.getByRole("button", { name: "Buy now" }).click({
        timeout: 2_000,
      });
    });
  },
);
