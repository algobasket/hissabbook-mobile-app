# HissabBook Mobile Web App

This is the mobile-optimized web application for HissabBook, built with [Next.js](https://nextjs.org).

## Overview

This is a separate mobile web application that provides a mobile-optimized experience for HissabBook users. It shares the same backend infrastructure as the main React application but is designed specifically for mobile devices.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

## Environment Variables

Make sure to set up the following environment variables:

- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (e.g., `http://localhost:5000` for development)
- `NEXT_PUBLIC_API_BASE_URL` - API system URL for OTP services (e.g., `http://localhost:4000` for development)

## Building for Production

```bash
npm run build
npm start
```

## Docker

To build and run with Docker:

```bash
docker build -t hissabbook-mobile-web-app .
docker run -p 3002:3002 hissabbook-mobile-web-app
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
