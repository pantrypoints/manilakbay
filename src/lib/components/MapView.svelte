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

  function getSidewalkColor(width: number): string {
    if (width >= 5) return '#22C55E';
    if (width >= 3) return '#EAB308';
    if (width >= 1.2) return '#F97316';
    if (width > 0) return '#EF4444';
    return '#171717';
  }

  // Create custom marker icons
  function createTricycleIcon(L: any): DivIcon {
    return L.divIcon({
      html: `<div style="
        width: 28px;
        height: 28px;
        background: ${TRANSPORT_COLORS.tricycle};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(16,185,129,0.4);
        font-size: 14px;
      ">🛺</div>`,
      className: 'custom-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }

  function createBicycleIcon(L: any): DivIcon {
    return L.divIcon({
      html: `<div style="
        width: 28px;
        height: 28px;
        background: ${TRANSPORT_COLORS.bicycle};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(59,130,246,0.4);
        font-size: 14px;
      ">🚲</div>`,
      className: 'custom-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
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

    // Jeepney layer
    jeepneyLayer = L.layerGroup();
    for (const route of jeepneyData.routes) {
      const line = L.polyline(route.path, {
        color: TRANSPORT_COLORS.jeepney,
        weight: 4,
        opacity: 0.85,
        className: 'route-line'
      });
      line.bindTooltip(`<b>🚌 Jeepney</b><br>${route.name}`, { sticky: true, className: 'route-tooltip' });
      jeepneyLayer.addLayer(line);
    }

    // Bus layer
    busLayer = L.layerGroup();
    for (const route of busData.routes) {
      const line = L.polyline(route.path, {
        color: TRANSPORT_COLORS.bus,
        weight: 5,
        opacity: 0.85,
        dashArray: '10,5',
        className: 'route-line'
      });
      line.bindTooltip(`<b>🚌 Bus</b><br>${route.name}`, { sticky: true, className: 'route-tooltip' });
      busLayer.addLayer(line);
    }

    // UV Express layer
    uvLayer = L.layerGroup();
    for (const route of uvData.routes) {
      const line = L.polyline(route.path, {
        color: TRANSPORT_COLORS.uv,
        weight: 4,
        opacity: 0.85,
        dashArray: '6,4',
        className: 'route-line'
      });
      line.bindTooltip(`<b>🚐 UV Express</b><br>${route.name}`, { sticky: true, className: 'route-tooltip' });
      uvLayer.addLayer(line);
    }

    // Tricycle layer - MARKERS instead of routes
    tricycleLayer = L.layerGroup();
    const tricycleIcon = createTricycleIcon(L);
    
    const tricycleLocations = tricycleData.terminals || tricycleData.points || tricycleData.locations || [];
    
    for (const point of tricycleLocations) {
      const lat = point.lat || point.latitude || point.coordinates?.[1];
      const lng = point.lng || point.longitude || point.coordinates?.[0];
      
      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon: tricycleIcon });
        
        const name = point.name || 'Tricycle Terminal';
        const description = point.description || point.address || '';
        const fare = point.fare || point.base_fare || '';
        const operatingHours = point.operating_hours || point.hours || '';
        
        let popupContent = `<div class="marker-popup">
          <h3>🛺 ${name}</h3>`;
        
        if (description) popupContent += `<p>${description}</p>`;
        if (fare) popupContent += `<p><strong>Base fare:</strong> ${fare}</p>`;
        if (operatingHours) popupContent += `<p><strong>Hours:</strong> ${operatingHours}</p>`;
        
        popupContent += `</div>`;
        
        marker.bindPopup(popupContent, { 
          maxWidth: 250,
          className: 'custom-popup'
        });
        
        marker.bindTooltip(`<b>🛺</b> ${name}`, { 
          sticky: true, 
          className: 'route-tooltip',
          direction: 'top'
        });
        
        tricycleLayer.addLayer(marker);
      }
    }

    // Bicycle layer - MARKERS for parking points
    bicycleLayer = L.layerGroup();
    const bicycleIcon = createBicycleIcon(L);
    
    const bicycleLocations = bicycleData.parking || bicycleData.points || bicycleData.locations || [];
    
    for (const point of bicycleLocations) {
      const lat = point.lat || point.latitude || point.coordinates?.[1];
      const lng = point.lng || point.longitude || point.coordinates?.[0];
      
      if (lat && lng) {
        const marker = L.marker([lat, lng], { icon: bicycleIcon });
        
        const name = point.name || 'Bicycle Parking';
        const capacity = point.capacity || point.spots || '';
        const type = point.type || point.parking_type || '';
        const covered = point.covered !== undefined ? (point.covered ? 'Yes' : 'No') : '';
        const fee = point.fee || point.cost || '';
        
        let popupContent = `<div class="marker-popup">
          <h3>🚲 ${name}</h3>`;
        
        if (type) popupContent += `<p><strong>Type:</strong> ${type}</p>`;
        if (capacity) popupContent += `<p><strong>Capacity:</strong> ${capacity} bikes</p>`;
        if (covered !== '') popupContent += `<p><strong>Covered:</strong> ${covered}</p>`;
        if (fee) popupContent += `<p><strong>Fee:</strong> ${fee}</p>`;
        
        popupContent += `</div>`;
        
        marker.bindPopup(popupContent, { 
          maxWidth: 250,
          className: 'custom-popup'
        });
        
        marker.bindTooltip(`<b>🚲</b> ${name}`, { 
          sticky: true, 
          className: 'route-tooltip',
          direction: 'top'
        });
        
        bicycleLayer.addLayer(marker);
      }
    }

    // Sidewalk layer
    sidewalkLayer = L.layerGroup();
    for (const sw of sidewalkData.sidewalks) {
      const color = getSidewalkColor(sw.width_m);
      const line = L.polyline(sw.path, {
        color,
        weight: 5,
        opacity: 0.9,
        className: 'sidewalk-line'
      });
      const widthLabel = sw.width_m > 0 ? `${sw.width_m}m wide` : 'Impassable / No sidewalk';
      line.bindTooltip(`<b>🚶 Sidewalk</b><br>${sw.name}<br>${widthLabel}`, { sticky: true, className: 'route-tooltip' });
      sidewalkLayer.addLayer(line);
    }

    // Apply initial visibility
    updateLayerVisibility();
  }

  function updateLayerVisibility() {
    if (!map) return;

    const zoom = map.getZoom();
    const shouldShow = zoom >= ROUTE_ZOOM_THRESHOLD;

    // Helper to add/remove layer based on conditions
    const toggleLayer = (layer: LayerGroup | null, show: boolean, requiresZoom: boolean = true) => {
      if (!layer || !map) return;
      const shouldAdd = show && (!requiresZoom || shouldShow);
      if (shouldAdd) {
        if (!map.hasLayer(layer)) map.addLayer(layer);
      } else {
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    };

    toggleLayer(jeepneyLayer, showJeepney);
    toggleLayer(busLayer, showBus);
    toggleLayer(uvLayer, showUV);
    toggleLayer(tricycleLayer, showTricycle);
    toggleLayer(bicycleLayer, showBicycle);
    toggleLayer(sidewalkLayer, showSidewalks);
  }

  // Make the effect track all toggle state changes
  $effect(() => {
    // Access all toggle states to track them
    const jeepney = showJeepney;
    const bus = showBus;
    const uv = showUV;
    const tricycle = showTricycle;
    const bicycle = showBicycle;
    const sidewalks = showSidewalks;
    const zoom = currentZoom;
    
    updateLayerVisibility();
  });

  onMount(() => {
    console.log("Component mounted, checking for Leaflet...");
    
    if (typeof window !== 'undefined' && (window as any).L) {
      console.log("Leaflet already loaded");
      initMap((window as any).L);
      return;
    }
    
    const scriptCheck = setInterval(() => {
      const L = (window as any).L;
      if (L && typeof L.map === 'function') {
        clearInterval(scriptCheck);
        console.log("Leaflet loaded!");
        initMap(L);
      }
    }, 100);
    
    const existingScript = document.querySelector('script[src*="leaflet"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        console.log("Leaflet script loaded event");
        const L = (window as any).L;
        if (L) initMap(L);
      });
    }
    
    function initMap(L: any) {
      if (!mapContainer) {
        console.error("No map container");
        return;
      }
      
      console.log("Initializing map...");
      
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
      });
      
      map = L.map(mapContainer, {
        zoomControl: false
      }).setView(INITIAL_VIEW, INITIAL_ZOOM);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);
      
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      
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
    
    return () => {
      if (map) map.remove();
    };
  });
</script>





<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
</svelte:head>

<div class="map-wrapper">
  <!-- Map container -->
  <div bind:this={mapContainer} class="map-container"></div>

  <!-- Header bar -->
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

  <!-- Controls Panel -->
  <div class="controls-panel">
    <button class="panel-toggle" onclick={() => showLegend = !showLegend}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
      <span>Layers</span>
      {#if showLegend}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      {/if}
    </button>

    {#if showLegend}
      <div class="panel-body">
        <!-- Transport routes -->
        <div class="section-label">TRANSPORT ROUTES</div>

        <label class="toggle-row" class:active={showJeepney}>
          <input type="checkbox" bind:checked={showJeepney} />
          <span class="color-dot" style="background: {TRANSPORT_COLORS.jeepney}"></span>
          <span class="toggle-label">Jeepney</span>
          {#if showJeepney}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          {/if}
        </label>

        <label class="toggle-row" class:active={showBus}>
          <input type="checkbox" bind:checked={showBus} />
          <span class="color-dot" style="background: {TRANSPORT_COLORS.bus}"></span>
          <span class="toggle-label">Bus</span>
          {#if showBus}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          {/if}
        </label>

        <label class="toggle-row" class:active={showUV}>
          <input type="checkbox" bind:checked={showUV} />
          <span class="color-dot" style="background: {TRANSPORT_COLORS.uv}"></span>
          <span class="toggle-label">UV Express</span>
          {#if showUV}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          {/if}
        </label>

        <!-- Tricycle terminals (markers) -->
        <label class="toggle-row" class:active={showTricycle}>
          <input type="checkbox" bind:checked={showTricycle} />
          <span class="color-dot" style="background: {TRANSPORT_COLORS.tricycle}"></span>
          <span class="toggle-label">Tricycle Terminals</span>
          {#if showTricycle}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          {/if}
        </label>

        <!-- Bicycle parking (markers) -->
        <label class="toggle-row" class:active={showBicycle}>
          <input type="checkbox" bind:checked={showBicycle} />
          <span class="color-dot" style="background: {TRANSPORT_COLORS.bicycle}"></span>
          <span class="toggle-label">Bicycle Parking</span>
          {#if showBicycle}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          {/if}
        </label>

        <!-- Sidewalks -->
        <div class="section-label" style="margin-top: 8px">PEDESTRIAN</div>

        <label class="toggle-row" class:active={showSidewalks}>
          <input type="checkbox" bind:checked={showSidewalks} />
          <span class="sidewalk-gradient"></span>
          <span class="toggle-label">Sidewalks</span>
          {#if showSidewalks}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          {:else}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          {/if}
        </label>

        {#if showSidewalks}
          <div class="sidewalk-legend">
            {#each SIDEWALK_COLOR_MAP as entry}
              <div class="sidewalk-legend-row">
                <span class="sidewalk-swatch" style="background: {entry.color}"></span>
                <span class="sidewalk-legend-label">{entry.label}</span>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Zoom notice - now showing routes are visible by default -->
        {#if !routesVisible}
          <div class="zoom-notice">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Zoom in to see routes (zoom ≥ {ROUTE_ZOOM_THRESHOLD})
          </div>
        {:else}
          <div class="zoom-active">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Routes visible — zoom {currentZoom}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Zoom level badge -->
  <div class="zoom-badge" class:unlocked={routesVisible}>
    {#if routesVisible}
      <span>🗺️ Routes ON · z{currentZoom}</span>
    {:else}
      <span>🔍 Zoom in for routes · z{currentZoom}/{ROUTE_ZOOM_THRESHOLD}</span>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Inter', 'Segoe UI', sans-serif;
  }

  .map-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: #e8e8e8;
  }

  .map-container {
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  /* Header */
  .app-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%);
    padding: 14px 20px;
    pointer-events: none;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1a1a1a;
  }

  .header-brand :global(svg) {
    color: #F59E0B;
  }

  .brand-name {
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #1a1a1a;
    text-shadow: 0 0 20px rgba(245,158,11,0.3);
  }

  .brand-tagline {
    font-size: 0.72rem;
    color: rgba(0,0,0,0.5);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* Controls Panel */
  .controls-panel {
    position: absolute;
    top: 60px;
    left: 16px;
    z-index: 1000;
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    min-width: 200px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .panel-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 14px;
    background: none;
    border: none;
    color: #1a1a1a;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;
  }

  .panel-toggle:hover {
    background: rgba(0,0,0,0.04);
  }

  .panel-toggle :global(svg) {
    color: #F59E0B;
  }

  .panel-toggle span {
    flex: 1;
  }

  .panel-body {
    padding: 4px 12px 12px;
    border-top: 1px solid rgba(0,0,0,0.08);
  }

  .section-label {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(0,0,0,0.45);
    margin: 10px 0 6px;
    text-transform: uppercase;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.12s;
    margin-bottom: 2px;
  }

  .toggle-row:hover {
    background: rgba(0,0,0,0.04);
  }

  .toggle-row.active {
    background: rgba(0,0,0,0.02);
  }

  .toggle-row input[type="checkbox"] {
    display: none;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px currentColor;
  }

  .sidewalk-gradient {
    width: 20px;
    height: 8px;
    border-radius: 3px;
    flex-shrink: 0;
    background: linear-gradient(to right, #22C55E, #EAB308, #F97316, #EF4444, #171717);
  }

  .toggle-label {
    flex: 1;
    font-size: 0.8rem;
    color: #374151;
  }

  .toggle-row :global(svg) {
    color: rgba(0,0,0,0.4);
  }

  .toggle-row.active :global(svg) {
    color: rgba(0,0,0,0.7);
  }

  /* Sidewalk legend */
  .sidewalk-legend {
    margin: 6px 0 4px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .sidewalk-legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sidewalk-swatch {
    width: 20px;
    height: 5px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .sidewalk-legend-label {
    font-size: 0.72rem;
    color: rgba(0,0,0,0.6);
  }

  /* Zoom notice */
  .zoom-notice {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 6px 8px;
    border-radius: 6px;
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.3);
    font-size: 0.72rem;
    color: #92400E;
  }

  .zoom-active {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 6px 8px;
    border-radius: 6px;
    background: rgba(34,197,94,0.1);
    border: 1px solid rgba(34,197,94,0.3);
    font-size: 0.72rem;
    color: #166534;
  }

  /* Zoom badge */
  .zoom-badge {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.75rem;
    color: rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
    pointer-events: none;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .zoom-badge.unlocked {
    border-color: rgba(34,197,94,0.4);
    color: #166534;
    background: rgba(240,253,244,0.95);
    box-shadow: 0 0 16px rgba(34,197,94,0.15);
  }

  /* Leaflet overrides */
  :global(.route-tooltip) {
    background: rgba(255,255,255,0.95) !important;
    border: 1px solid rgba(0,0,0,0.15) !important;
    color: #1a1a1a !important;
    font-size: 0.78rem !important;
    border-radius: 8px !important;
    padding: 6px 10px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }

  :global(.route-tooltip::before) {
    display: none !important;
  }

  /* Custom marker and popup styles */
  :global(.custom-marker) {
    background: transparent !important;
    border: none !important;
  }

  :global(.custom-popup) {
    padding: 4px;
  }

  :global(.custom-popup h3) {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #1a1a1a;
  }

  :global(.custom-popup p) {
    margin: 4px 0;
    font-size: 0.8rem;
    color: #374151;
  }

  :global(.leaflet-popup-content-wrapper) {
    border-radius: 10px !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
  }

  :global(.leaflet-control-attribution) {
    background: rgba(255,255,255,0.85) !important;
    color: rgba(0,0,0,0.45) !important;
    font-size: 0.65rem !important;
  }

  :global(.leaflet-control-attribution a) {
    color: rgba(0,0,0,0.6) !important;
  }

  :global(.leaflet-control-zoom) {
    border: 1px solid rgba(0,0,0,0.12) !important;
    border-radius: 8px !important;
    overflow: hidden;
  }

  :global(.leaflet-control-zoom a) {
    background: rgba(255,255,255,0.95) !important;
    color: #1a1a1a !important;
    border-bottom-color: rgba(0,0,0,0.1) !important;
  }

  :global(.leaflet-control-zoom a:hover) {
    background: rgba(245,245,245,0.95) !important;
  }

  /* Grayscale map enhancements */
  :global(.leaflet-container) {
    background: #e8e8e8;
  }

  /* Make transport lines more visible with glow */
  :global(.route-line) {
    filter: drop-shadow(0 0 4px currentColor);
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  :global(.sidewalk-line) {
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>

