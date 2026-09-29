export type ProductCategory = 'apple_gift_cards' | 'amazon_gift_cards' | 'luxury_watches';
export type OrderStatus = 'pending_payment' | 'payment_verifying' | 'processing' | 'completed' | 'cancelled';
export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  discount_percentage: number;
  image_url: string;
  stock: number;
  created_at: string;
}

export interface CryptoPaymentMethod {
  id: string;
  crypto_name: string;
  network: string;
  wallet_address: string;
  qr_code_url: string;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;
  crypto_method_id: string | null;
  crypto_tx_hash: string | null;
  shipping_address: Record<string, any> | null;
  created_at: string;
  profiles?: Profile;
  crypto_payment_methods?: CryptoPaymentMethod;
  order_items?: OrderItem[];
}