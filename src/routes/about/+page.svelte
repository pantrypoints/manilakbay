<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  const partners = [
    {
      name: 'Pantrypoints',
      url: 'https://pantrypoints.com',
      icon: '🏪',
      description: 'Food supply chain management'
    },
    {
      name: 'Superphysics',
      url: 'https://superphysics.org',
      icon: '⚛️',
      description: 'Alternative physics and economics'
    },
    {
      name: 'Unlad Saka',
      url: 'https://unladsaka.com',
      icon: '🌾',
      description: 'Agricultural development'
    },
    {
      name: 'Himalayan Asia',
      url: 'https://www.facebook.com/Himalayanasia/',
      icon: '🏔️',
      description: 'Himalayan cultural preservation'
    }
  ];

  // Duplicate partners for seamless scrolling
  const tickerPartners = [...partners, ...partners, ...partners];

  let isPaused = $state(false);
  let tickerRef: HTMLDivElement;
  let animationId: number;
  let scrollPosition = 0;
  const SCROLL_SPEED = 0.5;

  function scrollTicker() {
    if (!tickerRef) {
      animationId = requestAnimationFrame(scrollTicker);
      return;
    }

    if (!isPaused) {
      scrollPosition += SCROLL_SPEED;
      
      const singleSetWidth = tickerRef.scrollWidth / 3;
      if (scrollPosition >= singleSetWidth) {
        scrollPosition = 0;
      }
      
      tickerRef.style.transform = `translateX(-${scrollPosition}px)`;
    }
    
    animationId = requestAnimationFrame(scrollTicker);
  }

  onMount(() => {
    animationId = requestAnimationFrame(scrollTicker);
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<svelte:head>
  <title>About - Manilakbay</title>
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 14 3 14 3 11" />
              <path d="M11 19L3 11 11 3" />
            </svg>
          </div>
          <h1>About <span class="highlight">Manilakbay</span></h1>
          <p class="hero-description">
            Your interactive commute guide for Metro Manila. Explore public transport routes, find tricycle terminals, bicycle parking, and check sidewalk conditions — all on one map.
          </p>
          <div class="button-group">
            <a href="/" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Back to Map
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section">
      <div class="container">
        <div class="card">
          <h2>Our Mission</h2>
          <p>
            Navigating Metro Manila can be challenging. With hundreds of jeepney routes, multiple bus lines, UV Express vans, and an ever-growing network of tricycle terminals and bicycle facilities, finding the best way to get around requires up-to-date, accessible information.
          </p>
          <p>
            We believe that public transportation data should be free, open, and easy to use. Manilakbay brings together route information, terminal locations, and infrastructure data into one intuitive map, helping commuters, tourists, and urban planners make informed decisions.
          </p>
        </div>
      </div>
    </section>

    <!-- How to Use Section -->
    <section class="section">
      <div class="container">
        <div class="card">
          <h2>How to Use the Map</h2>
          <div class="steps">
            <div class="step">
              <span class="step-icon">🔍</span>
              <div>
                <h3>Zoom In to See Routes</h3>
                <p>Routes become visible at zoom level 14 and above. Use the zoom controls (bottom-right) or scroll to explore different areas of Metro Manila.</p>
              </div>
            </div>
            <div class="step">
              <span class="step-icon">🎛️</span>
              <div>
                <h3>Toggle Layers</h3>
                <p>Use the Layers panel on the left to show or hide different transport types: jeepneys, buses, UV Express, tricycles, bicycles, and sidewalks.</p>
              </div>
            </div>
            <div class="step">
              <span class="step-icon">💡</span>
              <div>
                <h3>Hover for Details</h3>
                <p>Hover over routes and markers to see detailed information about each transport line, terminal, or facility.</p>
              </div>
            </div>
            <div class="step">
              <span class="step-icon">📍</span>
              <div>
                <h3>Contribute Data</h3>
                <p>Right-click or long-press anywhere on the map to report new bicycle parking or tricycle terminal locations and help improve the map for everyone.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <span class="feature-icon">🚌</span>
            <h3>Transport Routes</h3>
            <p>Jeepney, bus, and UV Express routes with detailed information</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🛺</span>
            <h3>Tricycle Terminals</h3>
            <p>Find tricycle terminals near you</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🚲</span>
            <h3>Bicycle Parking</h3>
            <p>Locate bicycle parking facilities</p>
          </div>
          <div class="feature-card">
            <span class="feature-icon">🚶</span>
            <h3>Sidewalk Conditions</h3>
            <p>Check sidewalk widths and walkability</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partners Section -->
    <section class="section">
      <div class="container">
        <div class="card">
          <h2>Our Partners</h2>
          <p class="section-subtitle">Manilakbay is proud to collaborate with these organizations working to improve communities.</p>

          <!-- Partner Ticker -->
          <div class="ticker-wrapper">
            <div 
              class="ticker-container"
              onmouseenter={() => isPaused = true}
              onmouseleave={() => isPaused = false}
            >
              <div class="ticker-overlay-left"></div>
              <div class="ticker-overlay-right"></div>

              <div class="ticker-track" bind:this={tickerRef}>
                {#each tickerPartners as partner, index}
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="partner-ticker-card"
                  >
                    <span class="partner-icon">{partner.icon}</span>
                    <div class="partner-info">
                      <h3>{partner.name}</h3>
                      <p class="partner-desc">{partner.description}</p>
                      <p class="partner-url">{partner.url.replace('https://', '').replace('www.', '')}</p>
                    </div>
                  </a>
                {/each}
              </div>
            </div>
            <p class="ticker-status">
              {isPaused ? '🖐️ Paused on hover — move mouse away to resume' : '🔄 Auto-scrolling — hover to pause'}
            </p>
          </div>

          <!-- Partner Grid -->
          <div class="partners-grid">
            {#each partners as partner}
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                class="partner-card"
              >
                <span class="partner-card-icon">{partner.icon}</span>
                <h3>{partner.name}</h3>
                <p class="partner-card-desc">{partner.description}</p>
                <p class="partner-card-url">{partner.url.replace('https://', '').replace('www.', '')}</p>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- Open Source -->
    <section class="section">
      <div class="container">
        <div class="card opensource-card">
          <h2>Open Source</h2>
          <p>
            Manilakbay is an open-source project. We believe in transparency and community collaboration. The map data and code are freely available for anyone to use, modify, and improve.
          </p>
          <div class="button-group" style="margin-top: 24px;">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="btn-primary">
              Contribute on GitHub →
            </a>
          </div>
        </div>
      </div>
    </section>

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

  /* Override the global overflow: hidden from app.css */
  :global(html), :global(body) {
    overflow: hidden;
    height: 100%;
  }

  .page-wrapper {
    position: absolute;
    inset: 0;
    /* This creates a local scroll container */
    overflow-y: auto; 
    overflow-x: hidden;
    height: 100vh;
    scroll-behavior: smooth;
  }


  .page-content {
    position: relative;
    z-index: 1;
    min-height: 100%;
    /* Ensure mouse events work for links and buttons */
    pointer-events: auto;
  }

  /* Map Background - Grayscale OpenStreetMap */
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

  .page-content {
    position: relative;
    z-index: 1;
    /* Ensure content is scrollable */
    pointer-events: auto;
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

  .section-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0 0 32px;
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

  /* Partner Ticker */
  .ticker-wrapper {
    margin: 32px 0;
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
    gap: 24px;
    will-change: transform;
  }

  .partner-ticker-card {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 12px 20px;
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
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .partner-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .partner-info h3 {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0;
    color: #111827;
    white-space: nowrap;
  }

  .partner-desc {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 3px 0;
    white-space: nowrap;
  }

  .partner-url {
    font-size: 0.6875rem;
    color: #9ca3af;
    margin: 0;
    white-space: nowrap;
  }

  .ticker-status {
    text-align: center;
    font-size: 0.8125rem;
    color: #6b7280;
    margin-top: 12px;
  }

  /* Partners Grid */
  .partners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 32px;
  }

  .partner-card {
    background: white;
    padding: 28px;
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .partner-card:hover {
    border-color: #fcd34d;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .partner-card-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 14px;
  }

  .partner-card h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 6px;
    color: #111827;
  }

  .partner-card-desc {
    font-size: 0.8125rem;
    color: #6b7280;
    margin: 0 0 10px;
  }

  .partner-card-url {
    font-size: 0.6875rem;
    color: #9ca3af;
    margin: 0;
    word-break: break-all;
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

  /* Responsive */
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

    .features-grid,
    .partners-grid {
      grid-template-columns: 1fr 1fr;
    }

    .footer-content {
      flex-direction: column;
      text-align: center;
    }
  }
</style>