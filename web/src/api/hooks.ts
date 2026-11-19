import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type Address,
  type Cart,
  type Category,
  type Order,
  type Product,
  type User,
} from "./client";

// Each hook names its request with a literal path, and each is used by at
// most two screens, so a screen's requests can be read from its file.

/** Layout: who is signed in. A 401 means signed out, an answer not an error. */
export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const response = await api.get<User>("/account", {
        validateStatus: (status) => status === 200 || status === 401,
      });
      return response.status === 200 ? response.data : null;
    },
  });
}

/** Product list. */
export function useProducts(q: string, categoryId: string) {
  return useQuery({
    queryKey: ["products", q, categoryId],
    queryFn: async () =>
      (
        await api.get<Product[]>("/products", {
          params: { q: q || undefined, categoryId: categoryId || undefined },
        })
      ).data,
  });
}

/** Product list. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
}

/** Product detail. */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => (await api.get<Product>(`/products/${id}`)).data,
  });
}

/** Cart and Checkout. */
export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<Cart>("/cart")).data,
  });
}

function useCartChange<T>(change: (input: T) => Promise<{ data: Cart }>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: T) => (await change(input)).data,
    onSuccess: (cart) => client.setQueryData(["cart"], cart),
  });
}

/** Product detail. */
export function useAddToCart() {
  return useCartChange(
    ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.post<Cart>("/cart/items", { productId, quantity }),
  );
}

/** Cart. */
export function useSetQuantity() {
  return useCartChange(
    ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch<Cart>(`/cart/items/${itemId}`, { quantity }),
  );
}

/** Cart. */
export function useRemoveFromCart() {
  return useCartChange((itemId: string) =>
    api.delete<Cart>(`/cart/items/${itemId}`),
  );
}

/** Cart. */
export function useApplyCoupon() {
  return useCartChange((code: string) =>
    api.post<Cart>("/cart/coupon", { code }),
  );
}

/** Cart. */
export function useRemoveCoupon() {
  return useCartChange(() => api.delete<Cart>("/cart/coupon"));
}

/** Checkout. */
export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/account/addresses")).data,
  });
}

export interface NewAddress {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

/** Checkout. */
export function useAddAddress() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (address: NewAddress) =>
      (await api.post<Address>("/account/addresses", address)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

/** Checkout. */
export function usePlaceOrder() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: string) =>
      (await api.post<Order>("/orders", { addressId })).data,
    onSuccess: () => client.invalidateQueries(),
  });
}

/** Order history. */
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get<Order[]>("/orders")).data,
  });
}

/** Order detail. */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get<Order>(`/orders/${id}`)).data,
  });
}

/** Order detail. */
export function useCancelOrder(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/orders/${id}/cancel`),
    onSuccess: () => client.invalidateQueries(),
  });
}
