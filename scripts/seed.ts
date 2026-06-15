/**
 * Seed Script - Creates 20 realistic customers + 50 random orders
 * Run via: GET /api/seed  (in browser or curl)
 */

import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

const CUSTOMER_NAMES = [
  "Aarav Sharma", "Priya Patel", "Rahul Verma", "Sneha Gupta", "Vikram Singh",
  "Ananya Nair", "Rohan Mehta", "Kavya Reddy", "Arjun Kumar", "Pooja Iyer",
  "Nikhil Joshi", "Divya Pillai", "Siddharth Rao", "Meera Krishnan", "Aditya Shah",
  "Riya Chaudhary", "Karthik Bose", "Nisha Agarwal", "Varun Mishra", "Deepika Malhotra",
];

const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com"];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function randDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randInt(0, daysAgo));
  return date;
}

export async function seedDatabase() {
  await dbConnect();

  // Clear existing data
  await Customer.deleteMany({});
  await Order.deleteMany({});
  console.log("[Seed] Cleared existing customers and orders.");

  // Create 20 customers
  const customers = [];
  for (let i = 0; i < 20; i++) {
    const name = CUSTOMER_NAMES[i];
    const emailBase = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
    const domain = DOMAINS[i % DOMAINS.length];

    customers.push({
      name,
      email: `${emailBase}@${domain}`,
      phone: `+91${randInt(7000000000, 9999999999)}`,
      totalSpends: randInt(500, 50000),
      visits: randInt(1, 25),
      lastVisitDate: randDate(180),
    });
  }

  const inserted = await Customer.insertMany(customers);
  console.log(`[Seed] Inserted ${inserted.length} customers.`);

  // Create 50 orders spread across customers
  const orders = [];
  const customerIds = inserted.map((c) => c._id);

  for (let i = 0; i < 50; i++) {
    const customerId = customerIds[i % customerIds.length];
    orders.push({
      customerId,
      amount: randFloat(200, 8000),
      date: randDate(365),
    });
  }

  await Order.insertMany(orders);
  console.log(`[Seed] Inserted 50 orders.`);

  return {
    customers: inserted.length,
    orders: 50,
  };
}
