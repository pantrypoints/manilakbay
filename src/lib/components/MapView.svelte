<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Map as LeafletMap, LayerGroup, Marker, DivIcon } from 'leaflet';

  let mapContainer: HTMLDivElement;
  let map: LeafletMap | null = null;

  // Layer groups
  let jeepneyLayer: LayerGroup | null = null;
  let busLayer: LayerGroup | null = null;
  let uvLayer: LayerGroup | null = null;
  let tricycleLayer: LayerGroup | null = null;
  let bicycleLayer: LayerGroup | null = null;
  let sidewalkLayer: LayerGroup | null = null;

  // Toggle states
  let showJeepney = $state(true);
  let showBus = $state(true);
  let showUV = $state(true);
  let showTricycle = $state(false);
  let showBicycle = $state(false);
  let showSidewalks = $state(false);
  let showLegend = $state(true);

  // Zoom state
  let currentZoom = $state(15);
  let routesVisible = $state(true);
  const ROUTE_ZOOM_THRESHOLD = 14;

  const METRO_MANILA_CENTER: [number, number] = [14.5547, 121.0244];
  const INITIAL_VIEW: [number, number] = [14.556610468041919, 121.02414579541572];
  const INITIAL_ZOOM = 15;

  const TRANSPORT_COLORS = {
    jeepney: '#F59E0B',
    bus: '#EF4444',
    uv: '#8B5CF6',
    tricycle: '#10B981',
    bicycle: '#3B82F6'
  };

  const SIDEWALK_COLOR_MAP = [
    { min: 5, color: '#22C55E', label: '≥ 5m' },
    { min: 3, color: '#EAB308', label: '3m – 5m' },
    { min: 1.2, color: '#F97316', label: '1.2m – 3m' },
    { min: 0.01, color: '#EF4444', label: '< 1.2m' },
    { min: 0, color: '#171717', label: 'Impassable / None' }
  ];

  // Contribution popup state
  let showContribForm = $state(false);
  let contribLat = $state(0);
  let contribLng = $state(0);
  let contribType = $state<'bicycle_parking' | 'tricycle_terminal'>('bicycle_parking');
  let contribName = $state('');
  let contribSubmitting = $state(false);
  let contribSuccess = $state(false);
  let contribError = $state('');

  // Long-press detection
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  const LONG_PRESS_MS = 600;

  function getSidewalkColor(width: number): string {
    if (width >= 5) return '#22C55E';
    if (width >= 3) return '#EAB308';
    if (width >= 1.2) return '#F97316';
    if (width > 0) return '#EF4444';
    return '#171717';
  }

  function createTricycleIcon(L: any): DivIcon {
    return L.divIcon({
      html: `<div style="width:28px;height:28px;background:${TRANSPORT_COLORS.tricycle};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(16,185,129,0.4);font-size:14px;">🛺</div>`,
      className: 'custom-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }

  function createBicycleIcon(L: any): DivIcon {
    return L.divIcon({
      html: `<div style="width:28px;height:28px;background:${TRANSPORT_COLORS.bicycle};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(59,130,246,0.4);font-size:14px;">🚲</div>`,
      className: 'custom-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }

  function openContribForm(lat: number, lng: number) {
    contribLat = parseFloat(lat.toFixed(6));
    contribLng = parseFloat(lng.toFixed(6));
    contribName = '';
    contribType = 'bicycle_parking';
    contribSuccess = false;
    contribError = '';
    showContribForm = true;
  }

  async function submitContrib() {
    contribSubmitting = true;
    contribError = '';
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contribType,
          name: contribName,
          lat: contribLat,
          lng: contribLng
        })
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      contribSuccess = true;
      setTimeout(() => { showContribForm = false; }, 1800);
    } catch (e: any) {
      contribError = e.message ?? 'Submission failed';
    } finally {
      contribSubmitting = false;
    }
  }

  async function loadRoutes(L: any, mapInstance: LeafletMap) {
    const [jeepneyData, busData, uvData, tricycleData, bicycleData, sidewalkData] = await Promise.all([
      fetch('/data/jeepney_routes.json').then(r => r.json()),
      fetch('/data/bus_routes.json').then(r => r.json()),
      fetch('/data/uv_routes.json').then(r => r.json()),
      fetch('/data/tricycle.json').then(r => r.json()),
      fetch('/data/bicycle.json').then(r => r.json()),
      fetch('/data/sidewalks.json').then(r => r.json())
    ]);

    jeepneyLayer = L.layerGroup();
    for (const route of jeepneyData.routes) {
      const line = L.polyline(route.path, { color: TRANSPORT_COLORS.jeepney, weight: 4, opacity: 0.85, className: 'route-line' });
      line.bindTooltip(`<b>🚌 Jeepney</b><br>${route.name}`, { sticky: true, className: 'route-tooltip' });
      jeepneyLayer.addLayer(line);
    }

    busLayer = L.layerGroup();
    for (const route of busData.routes) {
      const line = L.polyline(route.path, { color: TRANSPORT_COLORS.bus, weight: 5, opacity: 0.85, dashArray: '10,5', className: 'route-line' });
      line.bindTooltip(`<b>🚌 Bus</b><br>${route.name}`, { sticky: true, className: 'route-tooltip' });
      busLayer.addLayer(line);
    }

    uvLayer = L.layerGroup();
    for (const route of uvData.routes) {
      const line = L.polyline(route.path, { color: TRANSPORT_COLORS.uv, weight: 4, opacity: 0.85, dashArray: '6,4', className: 'route-line' });
      line.bindTooltip(`<b>🚐 UV Express</b><br>${route.name}`, { sticky: true, className: 'route-tooltip' });
      uvLayer.addLayer(line);
    }

    tricycleLayer = L.layerGroup();
    const tricycleIcon = createTricycleIcon(L);
    for (const point of (tricycleData.terminals || tricycleData.points || tricycleData.locations || [])) {
      const lat = point.lat || point.latitude || point.coordinates?.[1];
      const lng = point.lng || point.longitude || point.coordinates?.[0];
      if (!lat || !lng) continue;
      const marker = L.marker([lat, lng], { icon: tricycleIcon });
      const name = point.name || 'Tricycle Terminal';
      marker.bindPopup(`<div class="marker-popup"><h3>🛺 ${name}</h3>${point.description ? `<p>${point.description}</p>` : ''}</div>`, { maxWidth: 250, className: 'custom-popup' });
      marker.bindTooltip(`<b>🛺</b> ${name}`, { sticky: true, className: 'route-tooltip', direction: 'top' });
      tricycleLayer.addLayer(marker);
    }

    bicycleLayer = L.layerGroup();
    const bicycleIcon = createBicycleIcon(L);
    for (const point of (bicycleData.parking || bicycleData.points || bicycleData.locations || [])) {
      const lat = point.lat || point.latitude || point.coordinates?.[1];
      const lng = point.lng || point.longitude || point.coordinates?.[0];
      if (!lat || !lng) continue;
      const marker = L.marker([lat, lng], { icon: bicycleIcon });
      const name = point.name || 'Bicycle Parking';
      marker.bindPopup(`<div class="marker-popup"><h3>🚲 ${name}</h3>${point.capacity ? `<p><strong>Capacity:</strong> ${point.capacity} bikes</p>` : ''}</div>`, { maxWidth: 250, className: 'custom-popup' });
      marker.bindTooltip(`<b>🚲</b> ${name}`, { sticky: true, className: 'route-tooltip', direction: 'top' });
      bicycleLayer.addLayer(marker);
    }

    sidewalkLayer = L.layerGroup();
    for (const sw of sidewalkData.sidewalks) {
      const color = getSidewalkColor(sw.width_m);
      const line = L.polyline(sw.path, { color, weight: 5, opacity: 0.9, className: 'sidewalk-line' });
      const widthLabel = sw.width_m > 0 ? `${sw.width_m}m wide` : 'Impassable / No sidewalk';
      line.bindTooltip(`<b>🚶 Sidewalk</b><br>${sw.name}<br>${widthLabel}`, { sticky: true, className: 'route-tooltip' });
      sidewalkLayer.addLayer(line);
    }

    updateLayerVisibility();
  }

  function updateLayerVisibility() {
    if (!map) return;
    const shouldShow = map.getZoom() >= ROUTE_ZOOM_THRESHOLD;
    const toggleLayer = (layer: LayerGroup | null, show: boolean) => {
      if (!layer || !map) return;
      if (show && shouldShow) { if (!map.hasLayer(layer)) map.addLayer(layer); }
      else { if (map.hasLayer(layer)) map.removeLayer(layer); }
    };
    toggleLayer(jeepneyLayer, showJeepney);
    toggleLayer(busLayer, showBus);
    toggleLayer(uvLayer, showUV);
    toggleLayer(tricycleLayer, showTricycle);
    toggleLayer(bicycleLayer, showBicycle);
    toggleLayer(sidewalkLayer, showSidewalks);
  }

  $effect(() => {
    void showJeepney; void showBus; void showUV;
    void showTricycle; void showBicycle; void showSidewalks; void currentZoom;
    updateLayerVisibility();
  });

  onMount(() => {
    if (typeof window !== 'undefined' && (window as any).L) {
      initMap((window as any).L);
      return;
    }
    const scriptCheck = setInterval(() => {
      const L = (window as any).L;
      if (L && typeof L.map === 'function') { clearInterval(scriptCheck); initMap(L); }
    }, 100);

    function initMap(L: any) {
      if (!mapContainer) return;

      map = L.map(mapContainer, { zoomControl: false }).setView(INITIAL_VIEW, INITIAL_ZOOM);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd', maxZoom: 20
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Right-click to contribute
      map.on('contextmenu', (e: any) => {
        openContribForm(e.latlng.lat, e.latlng.lng);
      });

      // Long-press to contribute (touch)
      mapContainer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        longPressTimer = setTimeout(() => {
          if (!map) return;
          const point = L.point(touch.clientX - mapContainer.getBoundingClientRect().left, touch.clientY - mapContainer.getBoundingClientRect().top);
          const latlng = map.containerPointToLatLng(point);
          openContribForm(latlng.lat, latlng.lng);
        }, LONG_PRESS_MS);
      }, { passive: true });

      mapContainer.addEventListener('touchend', () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }, { passive: true });

      mapContainer.addEventListener('touchmove', () => {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      }, { passive: true });

      map.on('zoomend', () => {
        if (!map) return;
        currentZoom = map.getZoom();
        routesVisible = currentZoom >= ROUTE_ZOOM_THRESHOLD;
        updateLayerVisibility();
      });

      currentZoom = map.getZoom();
      routesVisible = currentZoom >= ROUTE_ZOOM_THRESHOLD;

      loadRoutes(L, map).catch(console.error);
    }

    return () => { if (map) map.remove(); };
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
</svelte:head>

<div class="map-wrapper">
  <div bind:this={mapContainer} class="map-container"></div>

  <header class="app-header">
    <div class="header-brand">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="3 11 22 14 3 14 3 11"></polygon>
        <path d="M11 19L3 11 11 3"></path>
      </svg>
      <span class="brand-name">Manilakbay</span>
      <span class="brand-tagline">Metro Manila Commute Guide</span>
    </div>
  </header>

  <div class="controls-panel">
    <button class="panel-toggle" onclick={() => showLegend = !showLegend}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <span>Layers</span>
      {#if showLegend}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      {/if}
    </button>

    {#if showLegend}
      <div class="panel-body">
        <div class="section-label">TRANSPORT ROUTES</div>

        {#each [
          { label: 'Jeepney', color: TRANSPORT_COLORS.jeepney, checked: showJeepney, onchange: () => showJeepney = !showJeepney },
          { label: 'Bus', color: TRANSPORT_COLORS.bus, checked: showBus, onchange: () => showBus = !showBus },
          { label: 'UV Express', color: TRANSPORT_COLORS.uv, checked: showUV, onchange: () => showUV = !showUV },
          { label: 'Tricycle Terminals', color: TRANSPORT_COLORS.tricycle, checked: showTricycle, onchange: () => showTricycle = !showTricycle },
          { label: 'Bicycle Parking', color: TRANSPORT_COLORS.bicycle, checked: showBicycle, onchange: () => showBicycle = !showBicycle },
        ] as row}
          <label class="toggle-row" class:active={row.checked} onclick={row.onchange}>
            <span class="color-dot" style="background:{row.color}"></span>
            <span class="toggle-label">{row.label}</span>
            {#if row.checked}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            {:else}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            {/if}
          </label>
        {/each}

        <div class="section-label" style="margin-top:8px">PEDESTRIAN</div>

        <label class="toggle-row" class:active={showSidewalks} onclick={() => showSidewalks = !showSidewalks}>
          <span class="sidewalk-gradient"></span>
          <span class="toggle-label">Sidewalks</span>
          {#if showSidewalks}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          {/if}
        </label>

        {#if showSidewalks}
          <div class="sidewalk-legend">
            {#each SIDEWALK_COLOR_MAP as entry}
              <div class="sidewalk-legend-row">
                <span class="sidewalk-swatch" style="background:{entry.color}"></span>
                <span class="sidewalk-legend-label">{entry.label}</span>
              </div>
            {/each}
          </div>
        {/if}

        {#if !routesVisible}
          <div class="zoom-notice">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Zoom in to see routes (zoom ≥ {ROUTE_ZOOM_THRESHOLD})
          </div>
        {:else}
          <div class="zoom-active">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            Routes visible — zoom {currentZoom}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="zoom-badge" class:unlocked={routesVisible}>
    {#if routesVisible}
      <span>🗺️ Routes ON · z{currentZoom}</span>
    {:else}
      <span>🔍 Zoom in for routes · z{currentZoom}/{ROUTE_ZOOM_THRESHOLD}</span>
    {/if}
  </div>

  <div class="contrib-hint">Right-click or long-press map to report a location</div>

  <!-- Contribution popup -->
  {#if showContribForm}
    <div class="contrib-overlay" onclick={() => showContribForm = false} role="presentation"></div>
    <div class="contrib-popup">
      <div class="contrib-header">
        <span class="contrib-title">📍 Report Location</span>
        <button class="contrib-close" onclick={() => showContribForm = false}>✕</button>
      </div>

      {#if contribSuccess}
        <div class="contrib-success">✅ Submitted! Thank you for contributing.</div>
      {:else}
        <div class="contrib-coords">
          <span class="coord-label">Lat</span><span class="coord-val">{contribLat}</span>
          <span class="coord-label">Lng</span><span class="coord-val">{contribLng}</span>
        </div>

        <div class="contrib-field">
          <label class="field-label">Your Name (optional)</label>
          <input
            class="field-input"
            type="text"
            placeholder="e.g. John"
            bind:value={contribName}
          />
        </div>

        <div class="contrib-field">
          <label class="field-label">Type</label>
          <div class="radio-group">
            <label class="radio-row" class:selected={contribType === 'bicycle_parking'}>
              <input type="radio" bind:group={contribType} value="bicycle_parking" />
              <span class="radio-icon">🚲</span>
              <span>Bicycle Parking</span>
            </label>
            <label class="radio-row" class:selected={contribType === 'tricycle_terminal'}>
              <input type="radio" bind:group={contribType} value="tricycle_terminal" />
              <span class="radio-icon">🛺</span>
              <span>Tricycle Terminal</span>
            </label>
          </div>
        </div>

        {#if contribError}
          <div class="contrib-error">⚠️ {contribError}</div>
        {/if}

 <!-- || !contribName.trim() -->
        <button
          class="contrib-submit"
          onclick={submitContrib}
          disabled={contribSubmitting}>
          {contribSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(body) { margin: 0; padding: 0; overflow: hidden; font-family: 'Inter', 'Segoe UI', sans-serif; }

  .map-wrapper { position: relative; width: 100vw; height: 100vh; background: #e8e8e8; }
  .map-container { width: 100%; height: 100%; z-index: 0; }

  .app-header {
    position: absolute; top: 0; left: 0; right: 0; z-index: 1000;
    background: linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
    padding: 14px 20px; pointer-events: none;
  }
  .header-brand { display: flex; align-items: center; gap: 10px; color: #1a1a1a; }
  .header-brand :global(svg) { color: #F59E0B; }
  .brand-name { font-size: 1.2rem; font-weight: 700; letter-spacing: 0.04em; color: #1a1a1a; }
  .brand-tagline { font-size: 0.72rem; color: rgba(0,0,0,0.5); letter-spacing: 0.06em; text-transform: uppercase; }

  .controls-panel {
    position: absolute; top: 60px; left: 16px; z-index: 1000;
    background: rgba(255,255,255,0.95); border: 1px solid rgba(0,0,0,0.1);
    border-radius: 12px; backdrop-filter: blur(12px); min-width: 200px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;
  }

  .panel-toggle {
    display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 14px;
    background: none; border: none; color: #1a1a1a; font-size: 0.82rem; font-weight: 600;
    letter-spacing: 0.05em; cursor: pointer; transition: background 0.15s; text-align: left;
  }
  .panel-toggle:hover { background: rgba(0,0,0,0.04); }
  .panel-toggle :global(svg) { color: #F59E0B; }
  .panel-toggle span { flex: 1; }

  .panel-body { padding: 4px 12px 12px; border-top: 1px solid rgba(0,0,0,0.08); }
  .section-label { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; color: rgba(0,0,0,0.45); margin: 10px 0 6px; text-transform: uppercase; }

  .toggle-row {
    display: flex; align-items: center; gap: 8px; padding: 6px 8px;
    border-radius: 8px; cursor: pointer; transition: background 0.12s; margin-bottom: 2px;
  }
  .toggle-row:hover { background: rgba(0,0,0,0.04); }
  .toggle-row.active { background: rgba(0,0,0,0.02); }
  .toggle-row input[type="checkbox"] { display: none; }
  .color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 6px currentColor; }
  .sidewalk-gradient { width: 20px; height: 8px; border-radius: 3px; flex-shrink: 0; background: linear-gradient(to right, #22C55E, #EAB308, #F97316, #EF4444, #171717); }
  .toggle-label { flex: 1; font-size: 0.8rem; color: #374151; }
  .toggle-row :global(svg) { color: rgba(0,0,0,0.4); }
  .toggle-row.active :global(svg) { color: rgba(0,0,0,0.7); }

  .sidewalk-legend { margin: 6px 0 4px 8px; display: flex; flex-direction: column; gap: 3px; }
  .sidewalk-legend-row { display: flex; align-items: center; gap: 8px; }
  .sidewalk-swatch { width: 20px; height: 5px; border-radius: 3px; flex-shrink: 0; }
  .sidewalk-legend-label { font-size: 0.72rem; color: rgba(0,0,0,0.6); }

  .zoom-notice {
    display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 8px;
    border-radius: 6px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
    font-size: 0.72rem; color: #92400E;
  }
  .zoom-active {
    display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 8px;
    border-radius: 6px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);
    font-size: 0.72rem; color: #166534;
  }

  .zoom-badge {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    z-index: 1000; background: rgba(255,255,255,0.95); border: 1px solid rgba(0,0,0,0.12);
    border-radius: 20px; padding: 6px 14px; font-size: 0.75rem; color: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px); pointer-events: none; transition: all 0.3s ease; white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .zoom-badge.unlocked { border-color: rgba(34,197,94,0.4); color: #166534; background: rgba(240,253,244,0.95); }

  .contrib-hint {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
    z-index: 1000; font-size: 0.68rem; color: rgba(0,0,0,0.38);
    pointer-events: none; white-space: nowrap;
  }

  /* Contribution popup */
  .contrib-overlay {
    position: fixed; inset: 0; z-index: 1999;
    background: rgba(0,0,0,0.25);
  }
  .contrib-popup {
    position: fixed; z-index: 2000;
    bottom: 60px; left: 50%; transform: translateX(-50%);
    width: min(340px, calc(100vw - 32px));
    background: #fff; border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    padding: 18px 20px 20px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .contrib-header { display: flex; align-items: center; justify-content: space-between; }
  .contrib-title { font-size: 0.95rem; font-weight: 700; color: #111; }
  .contrib-close {
    background: none; border: none; cursor: pointer; font-size: 1rem;
    color: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 6px;
    transition: background 0.12s;
  }
  .contrib-close:hover { background: rgba(0,0,0,0.06); }

  .contrib-coords {
    display: grid; grid-template-columns: auto 1fr; gap: 4px 10px;
    background: #f5f5f5; border-radius: 8px; padding: 10px 12px;
    font-size: 0.78rem;
  }
  .coord-label { color: rgba(0,0,0,0.45); font-weight: 600; }
  .coord-val { color: #111; font-family: monospace; }

  .contrib-field { display: flex; flex-direction: column; gap: 6px; }
  .field-label { font-size: 0.75rem; font-weight: 600; color: rgba(0,0,0,0.55); text-transform: uppercase; letter-spacing: 0.06em; }
  .field-input {
    border: 1.5px solid rgba(0,0,0,0.15); border-radius: 8px;
    padding: 8px 10px; font-size: 0.85rem; color: #111; outline: none;
    transition: border-color 0.15s;
  }
  .field-input:focus { border-color: #F59E0B; }

  .radio-group { display: flex; flex-direction: column; gap: 6px; }
  .radio-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1.5px solid rgba(0,0,0,0.12); transition: all 0.12s;
    font-size: 0.85rem; color: #374151;
  }
  .radio-row input[type="radio"] { display: none; }
  .radio-row.selected { border-color: #F59E0B; background: rgba(245,158,11,0.07); color: #111; font-weight: 600; }
  .radio-icon { font-size: 1.1rem; }

  .contrib-error {
    font-size: 0.78rem; color: #b91c1c;
    background: rgba(185,28,28,0.08); border-radius: 6px; padding: 6px 10px;
  }
  .contrib-success {
    font-size: 0.85rem; color: #166534;
    background: rgba(34,197,94,0.1); border-radius: 8px; padding: 12px;
    text-align: center; font-weight: 600;
  }

  .contrib-submit {
    background: #F59E0B; color: #fff; border: none; border-radius: 10px;
    padding: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer;
    transition: background 0.15s; letter-spacing: 0.02em;
  }
  .contrib-submit:hover:not(:disabled) { background: #D97706; }
  .contrib-submit:disabled { background: rgba(0,0,0,0.15); color: rgba(0,0,0,0.35); cursor: not-allowed; }

  /* Leaflet overrides */
  :global(.route-tooltip) {
    background: rgba(255,255,255,0.95) !important; border: 1px solid rgba(0,0,0,0.15) !important;
    color: #1a1a1a !important; font-size: 0.78rem !important; border-radius: 8px !important;
    padding: 6px 10px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }
  :global(.route-tooltip::before) { display: none !important; }
  :global(.custom-marker) { background: transparent !important; border: none !important; }
  :global(.custom-popup h3) { margin: 0 0 8px 0; font-size: 0.9rem; color: #1a1a1a; }
  :global(.custom-popup p) { margin: 4px 0; font-size: 0.8rem; color: #374151; }
  :global(.leaflet-popup-content-wrapper) { border-radius: 10px !important; box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; }
  :global(.leaflet-control-attribution) { background: rgba(255,255,255,0.85) !important; color: rgba(0,0,0,0.45) !important; font-size: 0.65rem !important; }
  :global(.leaflet-control-attribution a) { color: rgba(0,0,0,0.6) !important; }
  :global(.leaflet-control-zoom) { border: 1px solid rgba(0,0,0,0.12) !important; border-radius: 8px !important; overflow: hidden; }
  :global(.leaflet-control-zoom a) { background: rgba(255,255,255,0.95) !important; color: #1a1a1a !important; border-bottom-color: rgba(0,0,0,0.1) !important; }
  :global(.leaflet-control-zoom a:hover) { background: rgba(245,245,245,0.95) !important; }
  :global(.leaflet-container) { background: #e8e8e8; }
  :global(.route-line) { filter: drop-shadow(0 0 4px currentColor); stroke-linecap: round; stroke-linejoin: round; }
  :global(.sidewalk-line) { stroke-linecap: round; stroke-linejoin: round; }
</style>