# Look Hook Ecosystem Hub

**Look Hook** is a decentralized ecosystem and technology hub building practical tools and products for the Web3 space. This repository contains the frontend for the main portal, unifying all team services and initiatives into a single interactive interface.

## 🚀 Core Concept

The site serves as an interactive dashboard where users can manage their assets within the ecosystem, participate in reward distributions, and interact with Look Hook products. It is the "single window" entry point to the entire ecosystem.

### Key Modules & Features:

*   **Mining Hash (Proof of NFT):** A unique mining system for HASH tokens via NFT staking. Users can upgrade their "tools" and earn passive income.
*   **Rewards & Airdrops:** A comprehensive reward system for social activity (Telegram, YouTube, X) and community participation (Welcome bonuses, HeliDrop, Lambo).
*   **Identity & Domains:** A decentralized naming system (On-chain Domains) to simplify blockchain interactions.
*   **OG & Community:** Exclusive sections for early adopters (OG), including an achievement system (GMAchievement, WhaleAchievements).
*   **B2B Services:** The portal provides access to **Hook Capital** (investments), **Hook Dev** (development), **Hook Promote** (marketing), and **Hook Analytics** (auditing).

## 🛠 Tech Stack

*   **Core:** [React 19](https://react.dev/) — utilizing the latest library features.
*   **Framework:** [Vite](https://vitejs.dev/) — for fast builds and development.
*   **Web3:** [Thirdweb SDK v5](https://portal.thirdweb.com/) & [Viem](https://viem.sh/) — reliable smart contract interaction.
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) — modern and high-performance styling.
*   **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest) — for efficient blockchain data caching.

## ⚙️ Development Features

The project implements the **"Safe Sync"** pattern:
For stable data retrieval across long lists of addresses, we use strictly sequential polling with pauses between requests. This bypasses the strict rate limits of public RPC nodes and ensures data delivery without 429 errors.

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Package manager: `npm` or `bun` (recommended)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/lookhook.git
cd lookhook
bun install # or npm install
```

### 2. Run Development Server
```bash
bun dev # or npm run dev
```

### 3. Build for Production
```bash
bun build # or npm run build
```

## 📂 Project Structure

*   `src/components/` — Shared UI components (modals, spinners, cards).
*   `src/hooks/` — Custom hooks for smart contract interaction (rewards, staking logic, etc.).
*   `src/partials/` — Main sections of the home page (Mining, NFT, Services).
*   `src/utils/` — Contract ABIs and configuration files.
*   `src/lib/` — Web3 client initialization (thirdweb, viem).

---

Developed with ❤️ by **Look Hook Team**.
