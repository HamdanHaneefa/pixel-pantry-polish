# Shiprocket Fastrr Checkout & S2S Integration Documentation

> **Store Information**  
> * **Store Name**: Petpedia  
> * **Production Domain**: `https://www.petpedia.in`  
> * **Shopify Store Account**: `1fcjnw-tz.myshopify.com`  
> * **Framework**: Headless Shopify (React 19 / TanStack Start / Vite)  
> * **Integration Method**: Custom Frontend + Shopify Backend  

---

## 1. Executive Summary

This document details the complete frontend and backend integration of **Shiprocket Fastrr 1-Click Checkout** and **Server-to-Server (S2S) APIs** within the Petpedia headless Shopify storefront.

It covers:
1. **Checkout UI Flow — Custom Frontend + Shopify Backend (Client SDK)**
2. **S2S Login with Shiprocket APIs (OTP, Address Retrieval & Consent)**
3. **RTO Risk Assessment (HMAC-SHA256 Signing)**
4. **Webhook & Order Redirection Handling**

---

## 2. Checkout UI Flow — Custom Frontend + Shopify Backend

### 2.1 Head Script & Stylesheet Injection

Per official Shiprocket docs, the following are injected globally in `<head>` via [`src/routes/__root.tsx`](./src/routes/__root.tsx):

```html
<!-- Seller domain identification (required by Shiprocket SDK) -->
<input type="hidden" value="www.petpedia.in" id="sellerDomain"/>

<!-- Shiprocket Fastrr SDK Script (defer) -->
<script src="https://fastrr-boost-ui.pickrr.com/assets/js/channels/shopify.js" defer></script>

<!-- Shiprocket Fastrr CSS -->
<link rel="stylesheet" href="https://fastrr-boost-ui.pickrr.com/assets/styles/shopify.css">
```

### 2.2 Checkout Trigger — `shiprocketCheckoutEvents.buyDirect()`

When the buyer clicks the **"BUY NOW"** button on a Product Detail Page, Cart Drawer, or Cart Page:

```javascript
shiprocketCheckoutEvents.buyDirect({
  type: "cart",
  products: [
    {
      variantId: "43378789613657",
      quantity: 1
    }
  ]
  // Optional parameters:
  // couponCode: "WELCOME10",
  // utmParams: "utm_medium=cpc&utm_source=google",
  // cartAttributes: { gift_wrap: "true" }
});
```

**Accepted key-value pairs:**

| Key | Description | Type | Required |
| :--- | :--- | :--- | :--- |
| `type` | Checkout initiation source | `"cart"` or `"product"` | **Mandatory** |
| `products` | Products to initiate checkout with | `[{ variantId, quantity }]` | **Mandatory** |
| `couponCode` | Coupon code to be applied initially | `string` | Optional |
| `utmParams` | UTM parameters to be passed to Shopify | `string` | Optional |
| `cartAttributes` | Cart attributes to be passed to Shopify | `{ key: value }` | Optional |

### 2.3 Post-Order Redirect

Upon successful checkout payment, the customer is redirected to:
```
<redirect_url>?oid=<ORDER_ID>&ost=SUCCESS
```

For our store:
```
https://www.petpedia.in/order-success?oid=62f3d76a087fb021ee1c8b0e&ost=SUCCESS
```

---

## 3. Server-to-Server (S2S) APIs

All S2S endpoints are implemented in [`src/lib/shiprocket/fastrr.ts`](./src/lib/shiprocket/fastrr.ts).

* **Dev Base URL**: `https://fastrr-api-dev.pickrr.com`
* **Prod Base URL**: `https://checkout-api.shiprocket.com`

---

### 3.1 S2S Login Initiate (Send OTP)
* **Endpoint**: `POST /api/v1/access-token/s2s-login/initiate`
* **Headers**: `Content-Type: application/json`

**Request:**
```json
{
  "country_code": "91",
  "phone": "7306827008"
}
```

**Response (200 OK):**
```json
{
  "timestamp": "18-12-2023 04:59:43 PM",
  "ok": true,
  "latency": null,
  "result": {
    "token": "hFcFc2zzzSWaPuMTjafkmd0VyX2a3aLQ",
    "otp_length": 4,
    "resend_timer": 30
  },
  "error": null
}
```

---

### 3.2 S2S Login Verify (Validate OTP & Consent)
* **Endpoint**: `POST /api/v1/access-token/s2s-login/verify`
* **Headers**: `Content-Type: application/json`

**Request:**
```json
{
  "token": "hFcFc2zzzSWaPuMTjafkmd0VyX2a3aLQ",
  "otp": "1234",
  "user_address_consent": true
}
```

**Response (200 OK):**
```json
{
  "timestamp": "18-12-2023 05:02:29 PM",
  "ok": true,
  "latency": null,
  "result": {
    "authorised_customer_token": "ZPhXTpxkZf2sZb4kOcFGNyhTmTikGkU8",
    "expires_at": "2023-12-19T17:02:29.453667"
  },
  "error": null
}
```

**Buyer Consent Note**: On the S2S flow, consent must be handled in two ways:
- **On SMS**: Explicit consent from the buyer on the OTP SMS
- **On UI**: A branded message on our interface highlighting the consent between Shiprocket and the buyer

---

### 3.3 Fetch Customer Data & Saved Addresses
* **Endpoint**: `POST /api/v1/customer-data`
* **Headers**: `Content-Type: application/json`

**Request:**
```json
{
  "token": "ZPhXTpxkZf2sZb4kOcFGNyhTmTikGkU8"
}
```

**Response (200 OK):**
```json
{
  "timestamp": "18-12-2023 05:07:44 PM",
  "ok": true,
  "latency": null,
  "result": {
    "country_code": "91",
    "phone": "9999999999",
    "user_address_consent": true,
    "addresses": [
      {
        "phone": "9999999999",
        "line1": "in a galaxy far far away",
        "line2": "",
        "city": "New delhi",
        "pincode": "110001",
        "state": "Delhi",
        "country": "India",
        "country_code": null,
        "landmark": null,
        "first_name": "Test",
        "last_name": "",
        "email": "test@gmail.com"
      }
    ]
  },
  "error": null
}
```

---

### 3.4 Customer RTO Risk Assessment
* **Endpoint**: `POST /api/v1/customer-rto-risk`
* **Headers**:
  * `Content-Type: application/json`
  * `X-Api-Key: <API_KEY>`
  * `X-Api-HMAC-SHA256: <HMAC-SHA256 of request body with Base64 output>`

**Request:**
```json
{
  "token": "6Rvd932tzSGtSLwPHjAtKPd9BzW9qSuW",
  "rto_risk_request": {
    "items": [
      {
        "name": "Shirt",
        "quantity": 2,
        "price": 179.0
      }
    ],
    "total_price": 199.0
  },
  "timestamp": "2024-12-05T11:31:52.441660Z"
}
```

**Response (200 OK):**
```json
{
  "timestamp": "06-12-2024 09:24:44 PM",
  "ok": true,
  "latency": null,
  "result": {
    "refId": "6751f128fa268500c16aa65d",
    "rto_profile": {
      "risk": "high",
      "risk_tags": [
        "PAST_HISTORY",
        "UNUSUAL_PURCHASE_BEHAVIOUR"
      ]
    }
  },
  "error": null
}
```

---

## 4. Order Webhook — `POST` to Seller Registered Webhook URL

When an order is completed, Shiprocket posts the order payload to the seller webhook URL.

> **Recommendation**: Although webhooks are sent almost every time, create periodic jobs as a failsafe for pending orders to check their status (via Order/Details API).

**Webhook Payload:**
```json
{
  "order_id": "659fc40044f41a36bf1c556c",
  "cart_data": {
    "items": [
      {
        "variant_id": "1244539923890450",
        "quantity": 1
      }
    ]
  },
  "redirect_url": "https://www.petpedia.in/order-success?key=val",
  "status": "SUCCESS",
  "source": "web",
  "phone": "9999999999",
  "email": "customer@example.com",
  "shipping_plan": "Standard",
  "shipping_address": {
    "phone": "9999999999",
    "line1": "XXXXXX, New Delhi",
    "line2": "Near DDU Hospital",
    "city": "South West Delhi",
    "pincode": "110064",
    "state": "Delhi",
    "country": "India",
    "country_code": "IN",
    "landmark": null,
    "first_name": "Prerak",
    "last_name": "Mann",
    "email": "prerak.mann@pickrr.com"
  },
  "billing_address": {
    "phone": "9999999999",
    "line1": "XXXXXX, New Delhi",
    "line2": "XXX",
    "city": "South West Delhi",
    "pincode": "110064",
    "state": "Delhi",
    "country": "India",
    "country_code": "IN",
    "landmark": null,
    "first_name": "Prerak",
    "last_name": "Mann",
    "email": "prerak.mann@pickrr.com"
  },
  "rto_prediction": "low",
  "edd": "2024-01-11",
  "payment_type": "CASH_ON_DELIVERY",
  "payment_status": "Pending",
  "coupon_codes": [],
  "coupon_discount": 0.0,
  "prepaid_discount": null,
  "total_discount": 0.0,
  "cod_charges": 0.0,
  "subtotal_price": 224.0,
  "total_amount_payable": 224.0,
  "platform_order_id": "659fc40044f41a36bf1c556c"
}
```

**Response**: No response body expected.

---

## 5. Source Code File Map

| Component / Utility | File Path | Description |
| :--- | :--- | :--- |
| **Fastrr Core Client** | [`src/lib/shiprocket/fastrr.ts`](./src/lib/shiprocket/fastrr.ts) | S2S API functions, HMAC generation, and `shiprocketCheckoutEvents.buyDirect()` SDK trigger |
| **BUY NOW Button** | [`src/components/shiprocket/FastrrButton.tsx`](./src/components/shiprocket/FastrrButton.tsx) | Branded Fastrr pill button with GPay, PhonePe & Paytm |
| **Checkout Modal Fallback** | [`src/components/shiprocket/FastrrCheckoutModal.tsx`](./src/components/shiprocket/FastrrCheckoutModal.tsx) | Fallback UI when SDK is unavailable |
| **Root Shell & Head Config** | [`src/routes/__root.tsx`](./src/routes/__root.tsx) | Injects `sellerDomain`, Fastrr SDK script (defer), and CSS |
| **Cart Drawer Integration** | [`src/components/home/CartModal.tsx`](./src/components/home/CartModal.tsx) | Cart drawer Fastrr trigger with `variantId` + `quantity` |
| **Product Detail Integration**| [`src/components/home/ProductOverview.tsx`](./src/components/home/ProductOverview.tsx) | Instant 1-Click Buy Now with `variantId` + `quantity` |
| **Order Confirmation** | [`src/routes/order-success.tsx`](./src/routes/order-success.tsx) | Receives `oid` and `ost` query parameters |

---

## 6. Environment URLs Reference

| Environment | Script URL | CSS URL |
| :--- | :--- | :--- |
| **Custom Frontend + Shopify Backend** (our method) | `https://fastrr-boost-ui.pickrr.com/assets/js/channels/shopify.js` | `https://fastrr-boost-ui.pickrr.com/assets/styles/shopify.css` |
| Full Checkout Custom (Staging) | `https://customcheckoutfastrr.netlify.app/assets/js/channels/shopify.js` | `https://customcheckoutfastrr.netlify.app/assets/styles/shopify.css` |
| Full Checkout Custom (Prod) | `https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js` | `https://checkout-ui.shiprocket.com/assets/styles/shopify.css` |

| Environment | S2S API Base URL |
| :--- | :--- |
| **Dev** | `https://fastrr-api-dev.pickrr.com` |
| **Prod** | `https://checkout-api.shiprocket.com` |
