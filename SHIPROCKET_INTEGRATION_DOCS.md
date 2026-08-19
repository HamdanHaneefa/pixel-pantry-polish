# Shiprocket Fastrr Checkout & S2S Integration Documentation

> **Store Information**  
> * **Store Name**: Petpedia  
> * **Production Domain**: `https://www.petpedia.in`  
> * **Shopify Store Account**: `1fcjnw-tz.myshopify.com`  
> * **Framework**: Headless Shopify (React 19 / TanStack Start / Vite)  

---

## 1. Executive Summary

This document details the complete frontend and backend integration of **Shiprocket Fastrr 1-Click Checkout** and **Server-to-Server (S2S) APIs** within the Petpedia application. 

It covers:
1. **Headless Checkout UI Flow (Client SDK)**
2. **S2S Login with Shiprocket APIs (OTP, Address Retrieval & Consent)**
3. **RTO Risk Assessment (HMAC-SHA256 Signing)**
4. **Webhook & Order Redirection Handling**

---

## 2. Headless Checkout UI Flow (Client SDK)

### 2.1 Head Script & Stylesheet Injection
The official Shiprocket scripts are loaded globally in [`src/routes/__root.tsx`](./src/routes/__root.tsx):

```html
<!-- Shiprocket Fastrr Stylesheet -->
<link rel="stylesheet" href="https://checkout-ui.shiprocket.com/assets/styles/shopify.css" />

<!-- Shiprocket Configuration & Script -->
<script>
  window.shiprocketCheckoutChannel = "SHOPIFY";
  window.checkoutBuyer = "https://fastrr-boost-ui.pickrr.com/";
</script>
<script src="https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js" async></script>
```

### 2.2 Global Seller Domain Declaration
Inside the root component:
```html
<input type="hidden" id="sellerDomain" value="www.petpedia.in" />
```

### 2.3 Checkout Trigger Handlers
When the buyer clicks the **"BUY NOW"** button on a Product Detail Page, Cart Drawer, or Cart Page:

```typescript
// Triggering Shiprocket Fastrr Checkout Window with live product payload
window.shiprocketCheckoutDirectHandler({
  type: "cart",
  products: [
    {
      productId: "84729182739",
      variantId: "43378789613657",
      title: "Slicker Brush & Nail Clipper",
      price: 499,
      quantity: 1,
      image: "https://cdn.shopify.com/s/files/.../image.jpg"
    }
  ],
  fallbackUrl: "https://www.petpedia.in/checkout"
});
```

### 2.4 Post-Order Redirection
Upon successful checkout payment on Fastrr, the customer is redirected to:
```
https://www.petpedia.in/order-success?oid=<ORDER_ID>&ost=SUCCESS
```

---

## 3. Server-to-Server (S2S) APIs

All S2S endpoints are implemented in [`src/lib/shiprocket/fastrr.ts`](./src/lib/shiprocket/fastrr.ts).

* **Staging Base URL**: `https://fastrr-api-dev.pickrr.com`
* **Production Base URL**: `https://checkout-api.shiprocket.com`

---

### 3.1 S2S Login Initiate (Send OTP)
* **Endpoint**: `POST /api/v1/access-token/s2s-login/initiate`
* **Headers**: `Content-Type: application/json`

**Request Payload:**
```json
{
  "country_code": "91",
  "phone": "7306827008"
}
```

**Response Payload:**
```json
{
  "ok": true,
  "result": {
    "token": "tok_s2s_init_98a72b4c10df",
    "otp_length": 4,
    "resend_timer": 30
  }
}
```

---

### 3.2 S2S Login Verify (Validate OTP & Consent)
* **Endpoint**: `POST /api/v1/access-token/s2s-login/verify`
* **Headers**: `Content-Type: application/json`

**Request Payload:**
```json
{
  "token": "tok_s2s_init_98a72b4c10df",
  "otp": "1234",
  "user_address_consent": true
}
```

**Response Payload:**
```json
{
  "ok": true,
  "result": {
    "authorised_customer_token": "act_9f8d7e6c5b4a3210fe98dc76",
    "expires_at": "2026-08-20T12:00:00Z"
  }
}
```

---

### 3.3 Fetch Customer Data & Saved Addresses
* **Endpoint**: `POST /api/v1/customer-data`
* **Headers**: `Content-Type: application/json`

**Request Payload:**
```json
{
  "token": "act_9f8d7e6c5b4a3210fe98dc76"
}
```

**Response Payload:**
```json
{
  "ok": true,
  "result": {
    "country_code": "91",
    "phone": "7306827008",
    "user_address_consent": true,
    "first_name": "Hamdan",
    "last_name": "C",
    "email": "hamdanhaneefa23@gmail.com",
    "addresses": [
      {
        "first_name": "Hamdan",
        "last_name": "C",
        "phone": "7306827008",
        "email": "hamdanhaneefa23@gmail.com",
        "line1": "Chulliyil House Thallakkadathur, Tharayil",
        "line2": "areekad school ground road",
        "city": "Tirur, Malappuram",
        "state": "Kerala",
        "pincode": "676103",
        "country": "India",
        "country_code": "IN",
        "is_default": true
      }
    ]
  }
}
```

---

### 3.4 Customer RTO Risk Assessment
* **Endpoint**: `POST /api/v1/customer-rto-risk`
* **Headers**:
  * `Content-Type: application/json`
  * `X-Api-Key: <VITE_SHIPROCKET_API_KEY>`
  * `X-Api-HMAC-SHA256: <HMAC_SHA256(body, API_SECRET)>`

**Request Payload:**
```json
{
  "token": "act_9f8d7e6c5b4a3210fe98dc76",
  "rto_risk_request": {
    "items": [
      {
        "variant_id": "43378789613657",
        "quantity": 1,
        "price": 499
      }
    ],
    "total_price": 499
  },
  "timestamp": 1724068200000
}
```

**Response Payload:**
```json
{
  "ok": true,
  "result": {
    "refId": "ref_8f9a2b1c",
    "rto_profile": {
      "risk": "low",
      "risk_tags": [
        "VERIFIED_BUYER",
        "FREQUENT_ONLINE_SHOPPER",
        "HIGH_DELIVERY_SUCCESS"
      ]
    }
  }
}
```

---

## 4. Order Webhook Specification (`POSTOrder`)

When an order is completed, Shiprocket posts the order payload to the seller webhook URL:

```json
{
  "order_id": "659fc40044f41a36bf1c556c",
  "cart_data": {
    "items": [
      {
        "variant_id": "43378789613657",
        "quantity": 1
      }
    ]
  },
  "redirect_url": "https://www.petpedia.in/order-success",
  "status": "SUCCESS",
  "source": "web",
  "phone": "7306827008",
  "email": "hamdanhaneefa23@gmail.com",
  "shipping_plan": "Standard",
  "shipping_address": {
    "first_name": "Hamdan",
    "last_name": "C",
    "phone": "7306827008",
    "line1": "Chulliyil House Thallakkadathur",
    "line2": "areekad school ground road",
    "city": "Tirur",
    "state": "Kerala",
    "pincode": "676103",
    "country": "India",
    "country_code": "IN",
    "email": "hamdanhaneefa23@gmail.com"
  },
  "rto_prediction": "low",
  "edd": "2026-08-22"
}
```

---

## 5. Source Code File Map

| Component / Utility | File Path | Description |
| :--- | :--- | :--- |
| **Fastrr Core Client** | [`src/lib/shiprocket/fastrr.ts`](./src/lib/shiprocket/fastrr.ts) | S2S API functions, HMAC generation, and SDK trigger |
| **BUY NOW Button** | [`src/components/shiprocket/FastrrButton.tsx`](./src/components/shiprocket/FastrrButton.tsx) | Branded Fastrr pill button with GPay, PhonePe & Paytm |
| **Inbuilt Checkout Window** | [`src/components/shiprocket/FastrrCheckoutModal.tsx`](./src/components/shiprocket/FastrrCheckoutModal.tsx) | Complete Fastrr UI flow (Address, Coupons, UPI QR & COD) |
| **Root Shell & Head Config** | [`src/routes/__root.tsx`](./src/routes/__root.tsx) | Injects Fastrr SDK script, CSS, and sellerDomain |
| **Cart Drawer Integration** | [`src/components/home/CartModal.tsx`](./src/components/home/CartModal.tsx) | Cart drawer Fastrr trigger with live cart payload |
| **Product Detail Integration**| [`src/components/home/ProductOverview.tsx`](./src/components/home/ProductOverview.tsx) | Instant 1-Click Buy Now with product payload |
| **Order Confirmation** | [`src/routes/order-success.tsx`](./src/routes/order-success.tsx) | Receives `oid` and `ost` query parameters |
