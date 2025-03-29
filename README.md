# Ghiblify - AI Image Transformation

Ghiblify is a creative web application that transforms uploaded images into enchanting Studio Ghibli-inspired artwork using advanced AI technology, providing users with magical image manipulation and artistic rendering experiences.

## Features

- **AI Image Transformation**: Transform your images into Studio Ghibli style artwork using Replicate's Mirage Ghibli AI model
- **User Authentication**: Complete user authentication system with Supabase
- **Credit System**: Free credits for new users with options to earn more
- **Instagram Verification**: Verify your Instagram username to earn bonus credits
- **Payment Integration**: Purchase additional credits using Razorpay
- **Responsive Design**: Beautiful UI that works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: Supabase
- **AI**: Replicate Mirage Ghibli AI model
- **Authentication**: Supabase Auth
- **Payment**: Razorpay

## Environment Variables

To run this project, you need to set up the following environment variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
REPLICATE_API_KEY=your_replicate_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ghiblify.git
cd ghiblify
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables.

4. Start the development server:

```bash
npm run dev
```

## Database Setup

The project uses Supabase as a database. You need to create the following tables:

1. `users` - For storing user information
2. `credits_transactions` - For tracking credit transactions
3. `transformations` - For storing image transformations

The schema is defined in `shared/schema.ts`.

## API Routes

- `/api/auth/register` - Register a new user
- `/api/auth/login` - Login a user
- `/api/user/me` - Get current user details
- `/api/user/verify-instagram` - Verify Instagram username for credits
- `/api/user/credits` - Get user credits and transactions
- `/api/transform` - Transform an image
- `/api/transform/:id` - Get transformation status
- `/api/user/transformations` - Get user transformations
- `/api/create-order` - Create a Razorpay order
- `/api/verify-payment` - Verify a Razorpay payment

## Admin Features

- `/api/admin/users` - Get all users (admin only)
- `/api/admin/set-admin` - Set admin status for a user (admin only)
- `/api/admin/update-credits` - Update user credits (admin only)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.