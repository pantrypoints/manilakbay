<!-- src/routes/about/+page.svelte -->
<svelte:head>
  <title>Privacy - Manilakbay</title>
</svelte:head>

<div class="page-wrapper">
  <!-- Map Background -->
  <div class="map-background"></div>

  <!-- Scrollable Content -->
  <div class="page-content">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
             <img src="/m.png" a="Manilakbay">
          </div>
          <h1>Privacy Policy for <span class="highlight">Manilakbay</span></h1>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section">
      <div class="container">
        <div class="card">
          <p>Last Updated: May 9, 2026</p>

          <h3 class="text-2xl font-bold">1. Introduction</h3>

          <p>Welcome to Manilakbay ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Manilakbay mobile application (the "App"), a Metro Manila commute guide. By using the App, you agree to the collection and use of information in accordance with this policy.</p>


          <h3 class="text-2xl font-bold">2. Information We Collect</h3>

          <p>We collect only the following information via the user submission form:</p>

          <ul>
          <li>Latitude and Longitude information of spots designated by the user</li>
          <li>Spot type as parking spot, tricycle terminal, sidewalk locaiton, and route path</li>
          </ul>


<!-- 
### 2.2 Automatically Collected Information
The App may collect certain information automatically, including:

- **Device Information**: Device type, operating system version, unique device identifiers
- **Usage Data**: App interaction data, features accessed, time spent on the app
- **Error Logs**: Crash reports and performance data to improve app stability
- **Map Tile Requests**: Anonymous requests to map tile servers (CartoCDN) to display map data
 -->

          <h3 class="mt-4 text-2xl font-bold">3. How We Use the Information You Provide</h3>

          <p>We use the collected information to update the map with the information provided</p>

          <h3 class="text-2xl font-bold">4. Data Storage and Security</h3>

          <p>All transportation route data (jeepney, bus, UV express routes, tricycle terminals, bicycle parking, sidewalk segments) is stored locally on your device. No route data is transmitted to external servers except for map tile requests.</p>

          <h3 class="text-2xl font-bold">5. Changes to This Privacy Policy</h3>

          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h3 class="text-2xl font-bold">6. Contact Us</h3>

          <p>If you have any questions about this Privacy Policy, please email pantrypoints@gmail.com</p>
        </div>
      </div>
    </section>

          <div class="button-group">
            <a href="/" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Back to Map
            </a>
          </div>


    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 14 3 14 3 11" />
              <path d="M11 19L3 11 11 3" />
            </svg>
            <span>Manilakbay</span>
            <span class="footer-copy">© {new Date().getFullYear()}</span>
          </div>
          <div class="footer-links">
            <a href="/">Map</a>
            <a href="/about">About</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #1a1a1a;
    color: #111827;
    overflow-x: hidden;
  }

  :global(html), :global(body) {
    overflow: hidden;
    height: 100%;
  }

  .page-wrapper {
    position: absolute;
    inset: 0;
    overflow-y: auto; 
    overflow-x: hidden;
    height: 100vh;
    scroll-behavior: smooth;
  }

  .page-content {
    position: relative;
    z-index: 1;
    min-height: 100%;
    pointer-events: auto;
  }

  /* Map Background */
  .map-background {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-color: #d1d1d1;
    background-image: 
      linear-gradient(rgba(180, 180, 180, 0.3) 1px, transparent 1px),
      linear-gradient(90deg, rgba(180, 180, 180, 0.3) 1px, transparent 1px),
      linear-gradient(45deg, rgba(160, 160, 160, 0.2) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(160, 160, 160, 0.2) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(160, 160, 160, 0.2) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(160, 160, 160, 0.2) 75%);
    background-size: 
      40px 40px,
      40px 40px,
      80px 80px,
      80px 80px,
      80px 80px,
      80px 80px;
    background-position:
      0 0,
      0 0,
      0 0,
      0 20px,
      20px -20px,
      -20px 0px;
    filter: grayscale(100%) contrast(0.8) brightness(0.9);
  }

  .map-background::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, transparent 0%, transparent 30%, rgba(140, 140, 140, 0.4) 30%, rgba(140, 140, 140, 0.4) 32%, transparent 32%, transparent 35%,
        transparent 35%, transparent 60%, rgba(150, 150, 150, 0.3) 60%, rgba(150, 150, 150, 0.3) 62%, transparent 62%),
      linear-gradient(90deg, transparent 0%, transparent 40%, rgba(140, 140, 140, 0.4) 40%, rgba(140, 140, 140, 0.4) 42%, transparent 42%, transparent 45%,
        transparent 45%, transparent 70%, rgba(150, 150, 150, 0.3) 70%, rgba(150, 150, 150, 0.3) 72%, transparent 72%),
      linear-gradient(25deg, transparent 0%, transparent 20%, rgba(130, 130, 130, 0.25) 20%, rgba(130, 130, 130, 0.25) 21%, transparent 21%),
      linear-gradient(-35deg, transparent 0%, transparent 65%, rgba(130, 130, 130, 0.25) 65%, rgba(130, 130, 130, 0.25) 66%, transparent 66%);
  }

  .map-background::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 30%, rgba(180, 180, 180, 0.3) 0%, transparent 15%),
      radial-gradient(ellipse at 70% 60%, rgba(170, 170, 170, 0.25) 0%, transparent 20%),
      radial-gradient(ellipse at 40% 80%, rgba(180, 180, 180, 0.2) 0%, transparent 12%),
      radial-gradient(ellipse at 85% 15%, rgba(170, 170, 170, 0.3) 0%, transparent 18%),
      radial-gradient(ellipse at 10% 70%, rgba(140, 150, 160, 0.2) 0%, transparent 25%);
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Hero Section */
  .hero-section {
    padding: 100px 0 80px;
  }

  .hero-content {
    text-align: center;
  }

  .hero-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  h1 {
    font-size: 3rem;
    font-weight: 800;
    margin: 0 0 20px;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.02em;
  }

  .highlight {
    color: #fbbf24;
  }

  .hero-description {
    font-size: 1.125rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.85);
    max-width: 600px;
    margin: 0 auto 32px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .button-group {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f59e0b;
    color: #1a1a1a;
    padding: 14px 28px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.9375rem;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .btn-primary:hover {
    background: #fbbf24;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  /* Sections */
  .section {
    padding: 40px 0;
  }

  .card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 48px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .opensource-card {
    text-align: center;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 20px;
    color: #111827;
  }

  .card p {
    font-size: 1rem;
    line-height: 1.7;
    color: #4b5563;
    margin: 0 0 16px;
  }

  /* Steps */
  .steps {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-top: 32px;
  }

  .step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .step-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fef3c7;
    border-radius: 12px;
  }

  .step h3 {
    font-size: 1.0625rem;
    font-weight: 600;
    margin: 0 0 6px;
    color: #111827;
  }

  .step p {
    font-size: 0.9375rem;
    color: #6b7280;
    margin: 0;
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border-radius: 16px;
    padding: 28px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-4px);
  }

  .feature-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 8px;
    color: #111827;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  /* Partners Card */
  .partners-card {
    text-align: center;
  }

  .partners-title {
    text-align: center;
  }

  .partners-subtitle {
    text-align: center;
    font-size: 1rem;
    color: #6b7280;
    margin: 0 0 32px !important;
  }

  /* Centered Partner Icons */
  .partners-centered {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 40px;
    flex-wrap: wrap;
    padding: 20px 0;
  }

  .partner-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
  }

  .partner-link:hover {
    transform: translateY(-4px);
  }

  .partner-link:hover .partner-circle {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-color: #fcd34d;
  }

  .partner-link:hover .partner-name {
    color: #d97706;
  }

  .partner-circle {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .partner-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #111827;
    transition: color 0.2s;
  }

  /* Partner Ticker */
  .ticker-wrapper {
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .ticker-container {
    position: relative;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    padding: 20px 0;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .ticker-overlay-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 80px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.9), transparent);
    z-index: 10;
    pointer-events: none;
  }

  .ticker-overlay-right {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 80px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.9), transparent);
    z-index: 10;
    pointer-events: none;
  }

  .ticker-track {
    display: flex;
    gap: 32px;
    will-change: transform;
  }

  .partner-ticker-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
    flex-shrink: 0;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  .partner-ticker-card:hover {
    background: #fef3c7;
    border-color: #fcd34d;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .partner-ticker-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    transition: transform 0.2s;
  }

  .partner-ticker-card:hover .partner-ticker-icon {
    transform: scale(1.1);
  }

  .partner-ticker-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
  }

  .ticker-status {
    text-align: center;
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 12px;
  }

  /* Footer */
  .footer {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
    padding: 32px 0;
    margin-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .footer-copy {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 400;
  }

  .footer-links {
    display: flex;
    gap: 24px;
  }

  .footer-links a {
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.15s;
  }

  .footer-links a:hover {
    color: white;
  }

  @media (max-width: 640px) {
    h1 {
      font-size: 2rem;
    }

    .hero-section {
      padding: 60px 0 48px;
    }

    .card {
      padding: 28px 20px;
    }

    .features-grid {
      grid-template-columns: 1fr 1fr;
    }

    .partners-centered {
      gap: 24px;
    }

    .partner-circle {
      width: 64px;
      height: 64px;
      font-size: 2rem;
    }

    .partner-name {
      font-size: 0.8125rem;
    }

    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }
</style>

