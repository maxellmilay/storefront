import axios from "axios";

const TOKEN_KEY = "storefront.token";

/** Every call goes through this instance; nginx strips `/api`. */
export const api = axios.create({ baseURL: "/api" });

// A shopper who signs in on /sign-in keeps the token here. A browser check
// opened as an actor sends its own Authorization header instead and stores
// nothing, so this adds one only when the page has a token.
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token !== null) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string | null) {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Without storage the shopper stays signed in for this page only.
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  priceCents: number;
  stock: number;
  categoryId: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  coupon: string | null;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

export interface Address {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface Order {
  id: string;
  status: OrderStatus;
  shippingAddress: Omit<Address, "id">;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  items?: OrderItem[];
}

/** What the API sends with a refused request. */
interface ApiError {
  error?: string;
  details?: Record<string, string[] | undefined>;
}

/** The message the API sent with a refused request, or a generic one. */
export function errorOf(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.error ?? error.message;
  }
  return "Something went wrong.";
}

/** The API's validation messages for one field, if it sent any. */
export function fieldErrorOf(error: unknown, field: string): string | null {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.details?.[field]?.join(" ") ?? null;
  }
  return null;
}

export function price(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
