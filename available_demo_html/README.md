# HybridEstates - 5-Pillar Platform

Welcome to **HybridEstates** (Let'$Earnify), a comprehensive web platform integrating multiple earning streams: Referrals, Micro-tasks, Mudaraba Investments, Services Marketplace, and a Wallet system.

## Features

-   **Dashboard**: Real-time stats, portfolio visualization (Chart.js), and quick task access.
-   **Marketplace**: Browse and purchase services or complete micro-tasks.
-   **Investments**: "Mudaraba" style investment pools (Real Estate, Tech, SME) with tracking.
-   **Wallet**: Deposit/Withdrawal interface with transaction history.
-   **Referrals**: Multi-tier referral system tracking.
-   **FAQ**: Dedicated support page with accordion UI.
-   **Premium UI**: Dark/Gold theme, responsive design, smooth scroll animations (IntersectionObserver), and Toast notifications.

## Project Structure

-   `index.html`: Public landing page (Hero, Features, Pricing).
-   `dashboard.html`: User dashboard (requires login - simulated).
-   `marketplace.html`: Gigs and Tasks.
-   `investments.html`: Investment pools and portfolio.
-   `wallet.html`: Financial management.
-   `referrals.html`: Referral network stats.
-   `faq.html`: Support/Help page.
-   `style.css`: Core stylesheets, variables, and responsive rules.
-   `script.js`: Global logic (Sidebar, Auth, Toasts, Charts).

## Deployment

This is a **Static Site**. You can deploy it to any static hosting provider.

### Vercel / Netlify / GitHub Pages

1.  Upload the root folder content.
2.  Set the **Root Directory** to `./` (if asked).
3.  Publish.

### Docker (Optional)

Use a standard Nginx image:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

## Credits

Designed by **Antigravity** (Google DeepMind) in pair-programming mode.
