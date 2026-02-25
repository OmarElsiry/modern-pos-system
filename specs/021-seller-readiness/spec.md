# Feature Spec: JOECASHIER Seller Readiness

## 1. Overview
JOECASHIER is pivoting from a private local tool to a commercial SaaS/Self-hosted web application. This requires a professional storefront (README), a robust cloud deployment (Vercel), and a distinct value proposition against major competitors.

## 2. Requirements

### 2.1 Sales Portfolio
- **README (Market-Ready)**: A document that focuses on features, benefits, and business value.
- **Sales Strategy**: A clear breakdown of competitive advantages (Single payment vs Subscription, Privacy vs Cloud, Design vs Utility).
- **Screenshot Plan**: A list of key pages and what they should highlight to "wow" buyers.

### 2.2 Web Infrastructure (Vercel)
- **Database Abstraction**: The app must not crash when `better-sqlite3` is missing (i.e., in a browser).
- **Persistence Layer**: Support for Supabase to allow multi-device syncing and web-hosting.
- **Vercel Config**: Proper `vercel.json` or Vite environment settings for production deployment.

## 3. Competitive Analysis (The Coach's View)

| Feature | JOECASHIER | Shopify / Square |
| :--- | :--- | :--- |
| **Pricing** | One-time / Self-hosted | Monthly Subscription + % per sale |
| **Data** | 100% Owned by Merchant | Monitored by Provider |
| **Internet** | Work 100% offline | Requires active link for most features |
| **Hardware** | Supports generic printers/scanners | Often locked to proprietary hardware |
| **Design** | Modern Bento-Grid / Dark Luxury | Generic Corporate UI |

## 4. Screenshot Strategy
To sell a POS, you sell **Speed** and **Trust**.

1. **The "Heart": POS Screen**
   - *Why*: Shows how fast a cashier can work.
   - *Capture*: A full cart with diverse items, a selected customer, and the "Total" button glowing.
2. **The "Brain": Financial Dashboard**
   - *Why*: Business owners care about data.
   - *Capture*: The Recharts graphs showing sales trends and "Low Stock" alerts.
3. **The "Professionalism": PDF Invoice**
   - *Why*: This is what the customer sees.
   - *Capture*: A high-quality A4 or thermal receipt with a professional logo.
4. **The "Order": Product Inventory**
   - *Why*: Ease of management.
   - *Capture*: The glassmorphic table with colorful category tags.
