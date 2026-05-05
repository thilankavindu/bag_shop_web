/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Bag {
  _id?: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
}

export interface OrderItem {
  bagId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  customerName: string;
  email: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
}
