# 🐾 Petpedia - Shopify Headless Backend Setup Guide

This guide walks you through connecting your **Shopify Store** to this Petpedia frontend in just 5 minutes.

---

## ⚡ 1-Minute Quick Start

### Step 1: Get Shopify Storefront API Credentials
1. Log into your [Shopify Admin](https://admin.shopify.com).
2. Go to **Settings** → **Apps and sales channels**.
3. Search for or click on **Headless** (or install the free **Headless** sales channel from Shopify App Store).
4. Click **Add storefront** or open your existing Storefront.
5. Under **Storefront API**, copy:
   - **Store domain** (e.g. `your-store-name.myshopify.com`)
   - **Public access token** (e.g. `shpat_xxxxxxxxxxxxxx` or storefront token)

---

### Step 2: Paste Into `.env`
Open the [.env](file:///c:/Users/USER/Desktop/pixel-pantry-polish/.env) file in the root directory and paste your values:

```env
VITE_SHOPIFY_STORE_DOMAIN=your-store-name.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_public_storefront_access_token
VITE_SHOPIFY_API_VERSION=2026-01
VITE_USE_MOCK_DATA=false
```

Save the file. Your dev server will automatically reload and start serving live data directly from your Shopify store!

---

## 📦 Step 3: 1-Click Import All Petpedia Products to Shopify

You don't need to manually type each product! We generated a ready-to-use CSV:

1. Locate [shopify_products_import.csv](file:///c:/Users/USER/Desktop/pixel-pantry-polish/shopify_products_import.csv) in the project root.
2. In **Shopify Admin**, go to **Products** (left sidebar).
3. Click the **Import** button in the top right.
4. Click **Add file** and select `shopify_products_import.csv`.
5. Click **Upload and continue**, then **Import products**.
6. Done! All products with titles, high-resolution images, descriptions, tags, SKUs, and prices will appear in your Shopify Admin.

---

## 🏷️ Step 4: Creating Collections (Categories)
To create categories like "Dogs", "Cats", "Grooming", "Treats":
1. In Shopify Admin → **Products** → **Collections**.
2. Click **Create collection**.
3. Name it (e.g. `Dogs` or `Cats`).
4. Under **Collection type**, choose **Automated** → Tag is equal to `Dogs` (or choose Manual to pick products).
5. Ensure the collection is published to the **Headless** sales channel.

---

## 🛒 How the Cart & Checkout Work
1. **Adding to Cart:** Happens instantly on the frontend and creates a persistent Shopify Cart.
2. **Cart Drawer & Page:** Calculates real subtotals, quantities, discounts, and taxes.
3. **Checkout:** When the user clicks **Place Order / Proceed to Payment**, they are securely redirected to Shopify's hosted checkout where customer details, shipping methods, and payments (Cards, UPI, Wallets, COD) are securely handled with full PCI-DSS compliance.
4. **Order Success:** After payment on Shopify, the customer receives an official confirmation email and order tracking.
