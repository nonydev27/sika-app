# Sika - Personal Finance Tracker

Sika is a modern personal finance tracking application built with Next.js 14, Supabase, and AI capabilities. Track your daily expenses, manage budgets, and gain insights into your spending habits.

## Features

### 💰 Expense Tracking
- Record daily transactions with categories
- Upload receipts for automatic parsing via AI
- View transaction history with filtering

### 📊 Budget Management
- Set monthly budgets by category
- Track spending progress with visual indicators
- Get alerts when approaching budget limits

### 📈 Analytics & Insights
- Monthly spending trends visualization
- Category-wise spending breakdown (pie chart)
- Budget vs actual comparison (bar chart)

### 🤖 AI Features
- Smart receipt parsing with OCR
- AI-powered chat assistant for finance questions
- Natural language transaction entry

### 🎯 Onboarding
- 5-step guided setup for new users
- Category selection and budget initialization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: OpenAI API
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
sika-app/
├── app/
│   ├── (auth)/          # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/     # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── budget/
│   │       ├── daily/
│   │       ├── stats/
│   │       └── transactions/
│   ├── api/             # API routes
│   │   └── ai/
│   ├── onboarding/     # User onboarding
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/
│   ├── ai/             # AI components
│   ├── charts/         # Chart components
│   ├── dashboard/      # Dashboard components
│   ├── landing/        # Landing page components
│   ├── onboarding/     # Onboarding components
│   └── ui/             # Shared UI components
├── lib/
│   ├── supabase/       # Supabase client/server
│   ├── constants.ts    # App constants
│   ├── store.ts        # Zustand store
│   └── utils.ts        # Utility functions
└── public/             # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm/bun
- Supabase account

### Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

Run the SQL schema from [`supabase-schema.sql`](supabase-schema.sql) in your Supabase dashboard to create the required tables.

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

### Tables

- **users**: User profiles linked to Supabase Auth
- **categories**: Expense categories
- **transactions**: Individual expense records
- **budgets**: Monthly budget allocations
- **messages**: AI chat messages

## License

MIT
