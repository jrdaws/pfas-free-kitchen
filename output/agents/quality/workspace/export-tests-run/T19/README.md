# test-t19



## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd test-t19

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Integrations

No integrations configured.

## Project Structure

```
test-t19/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── ...
├── components/            # React components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

See `.env.example` for all available variables.



## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The easiest way to deploy is with [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT

---

Built with [Dawson-Does Framework](https://dawson-does.com)
