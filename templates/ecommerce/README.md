# E-commerce Template

A complete e-commerce application template with product catalog, shopping cart, and checkout.

## Features

- Product listing and detail pages
- Shopping cart with local state persistence
- Checkout flow
- Order history
- Responsive design

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── products/         # Product pages
│   ├── checkout/         # Checkout flow
│   └── orders/           # Order history
├── components/
│   ├── cart/             # Cart components
│   └── products/         # Product components
└── lib/
    ├── cart/             # Cart state management
    └── products/         # Product utilities
```

## Customization

1. Update product data in `lib/products/`
2. Configure payment integration
3. Customize styling in `tailwind.config.ts`

## Built With

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand (state management)

