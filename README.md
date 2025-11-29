# Look Hook

Look Hook is a team and platform that builds practical tools and products for the Web3 and digital asset space. We develop technologies that help projects grow, investors discover strong ideas, and users enjoy seamless blockchain experiences.

This repository contains the source code for the main landing page of the Look Hook ecosystem.

## Key Features & Products

The Look Hook ecosystem includes a variety of products and services:

*   **Blockchain Forum**: A Telegram community for discussing testnets, crypto trends, and project development.
*   **Mining Hash**: A unique NFT-powered mining project (Proof of NFT) where users stake special NFTs to earn HASH tokens.
*   **NFT Claim App**: A service for creating and launching NFT collections, featuring our "Plasma Cat" collection.
*   **On-chain Domains**: A decentralized naming system to simplify complex wallet addresses.
*   **DRUB**: A decentralized lending protocol for obtaining loans in the DRUB stablecoin.
*   **Hash Chain**: A low-transaction-cost blockchain solution, perfect for micropayments and gaming.
*   **Tips App**: A decentralized application for sending and receiving tips directly on the blockchain.

## Our Services

*   **Hook Capital**: A strategic fund to support early-stage Web3 projects with growth potential.
*   **Hook Dev**: Full-cycle Web3 architecture development, from concept to launch.
*   **Hook Promote**: Crypto marketing, listings, community gamification, and growth strategies.
*   **Hook Analytics**: In-depth project audits, on-chain metrics, and market-driven analysis.

## Tech Stack

*   **Framework**: React
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Web3 Integration**: Thirdweb

---

## Project Setup Instructions

To get this project up and running on a new machine, follow these steps:

### Prerequisites

Make sure you have Node.js and a package manager installed. This project uses `bun` for package management, but `npm` can also be used.

*   **Node.js**: [Download and install Node.js](https://nodejs.org/en/download/) (which includes npm).
*   **Bun (Recommended)**: [Install Bun](https://bun.sh/docs/installation).
    *   Alternatively, you can use `npm` which comes with Node.js.

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone <repository-url>
cd lookhook-landing
```
*(Replace `<repository-url>` with the actual URL of your Git repository)*

### 2. Install Dependencies

Navigate into the project directory and install the required dependencies.

**Using Bun (Recommended):**

```bash
bun install
```

**Using npm (Alternative):**

```bash
npm install
```

### 3. Run the Development Server

Once the dependencies are installed, you can start the development server:

**Using Bun:**

```bash
bun run dev
```

**Using npm:**

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173`.

### 4. Build for Production

To create a production-ready build of the application:

**Using Bun:**

```bash
bun run build
```

**Using npm:**

```bash
npm run build
```

This command will compile and optimize your application for deployment, placing the output files in the `dist` directory.