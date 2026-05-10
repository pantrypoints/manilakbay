<script>
  let lat = '';
  let lng = '';
  let selectedType = 'bicycle';
  
  const vehicleTypes = [
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'tricycle', label: 'Tricycle' },
    { value: 'bus', label: 'Bus' },
    { value: 'jeepney', label: 'Jeepney' },
    { value: 'uv_express', label: 'UV Express' }
  ];
  
  let submitted = false;
  let submitData = null;
  
  function handleSubmit() {
    // Validate lat/lng
    if (!lat || !lng) {
      alert('Please enter both latitude and longitude');
      return;
    }
    
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Please enter valid numbers for latitude and longitude');
      return;
    }
    
    submitData = {
      lat: latNum,
      lng: lngNum,
      type: selectedType,
      timestamp: new Date().toISOString()
    };
    
    submitted = true;
    console.log('Submitted:', submitData);
  }
  
  function resetForm() {
    lat = '';
    lng = '';
    selectedType = 'bicycle';
    submitted = false;
    submitData = null;
  }
</script>

<svelte:head>
  <title>Vehicle Parking Locator</title>
</svelte:head>

<div class="app-container">
  <div class="glass-card">
    <div class="header">
      <div class="accent-line"></div>
      <h1>Vehicle Parking Locator</h1>
      <p>Submit a parking location for vehicles</p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit}>
      <!-- Latitude and Longitude - Side by side -->
      <div class="input-row">
        <div class="input-group">
          <label for="lat">
            <span class="label-icon">🌐</span>
            Latitude
          </label>
          <input
            id="lat"
            type="number"
            step="any"
            placeholder="e.g., 14.581758748168673"
            bind:value={lat}
          />
        </div>
        
        <div class="input-group">
          <label for="lng">
            <span class="label-icon">📍</span>
            Longitude
          </label>
          <input
            id="lng"
            type="number"
            step="any"
            placeholder="e.g., 121.05427714164082"
            bind:value={lng}
          />
        </div>
      </div>
      
      <!-- Vehicle Type -->
      <div class="input-group">
        <label for="type">
          <span class="label-icon">🚗</span>
          Vehicle Type
        </label>
        <div class="type-buttons">
          {#each vehicleTypes as type}
            <button
              type="button"
              class="type-btn {selectedType === type.value ? 'active' : ''}"
              on:click={() => selectedType = type.value}
            >
              <span class="type-icon">
                {#if type.value === 'bicycle'}🚲
                {:else if type.value === 'tricycle'}🛺
                {:else if type.value === 'bus'}🚌
                {:else if type.value === 'jeepney'}🚐
                {:else if type.value === 'uv_express'}🚙
                {/if}
              </span>
              {type.label}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Submit Button -->
      <button type="submit" class="submit-btn">
        <span class="btn-icon">📌</span>
        Submit Location
      </button>
    </form>
    
    <!-- Success Message -->
    {#if submitted && submitData}
      <div class="success-panel">
        <div class="success-header">
          <span class="success-icon">✓</span>
          <h3>Location Submitted</h3>
        </div>
        <div class="success-details">
          <div class="detail-item">
            <span class="detail-label">Coordinates:</span>
            <span class="detail-value">{submitData.lat}, {submitData.lng}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Vehicle Type:</span>
            <span class="detail-value">
              {#if submitData.type === 'bicycle'}🚲 Bicycle
              {:else if submitData.type === 'tricycle'}🛺 Tricycle
              {:else if submitData.type === 'bus'}🚌 Bus
              {:else if submitData.type === 'jeepney'}🚐 Jeepney
              {:else if submitData.type === 'uv_express'}🚙 UV Express
              {/if}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Submitted:</span>
            <span class="detail-value">{new Date(submitData.timestamp).toLocaleString()}</span>
          </div>
        </div>
        <button on:click={resetForm} class="reset-btn">
          Submit Another
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Your provided CSS */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: #0a0c12;
  }
  
  :root {
    --color-bg: #0a0c12;
    --color-surface: rgba(12, 14, 22, 0.92);
    --color-border: rgba(255, 255, 255, 0.1);
    --color-text: #e2e8f0;
    --color-muted: rgba(255, 255, 255, 0.45);
    --color-accent: #F59E0B;
  }
  
  /* Additional custom styles */
  .app-container {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 1rem;
  }
  
  .glass-card {
    background: var(--color-surface);
    backdrop-filter: blur(12px);
    border: 1px solid var(--color-border);
    border-radius: 2rem;
    padding: 1.75rem;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
  }
  
  .header {
    text-align: center;
    margin-bottom: 1.75rem;
  }
  
  .accent-line {
    width: 60px;
    height: 3px;
    background: var(--color-accent);
    margin: 0 auto 1rem auto;
    border-radius: 3px;
  }
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }
  
  .header p {
    color: var(--color-muted);
    font-size: 0.9rem;
    margin: 0;
  }
  
  .input-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-muted);
    letter-spacing: 0.3px;
  }
  
  .label-icon {
    font-size: 1rem;
  }
  
  input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border);
    border-radius: 1rem;
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
    color: var(--color-text);
    transition: all 0.2s ease;
    outline: none;
    width: 100%;
  }
  
  input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
  }
  
  input::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
  
  /* Remove spinner buttons for number input */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type="number"] {
    -moz-appearance: textfield;
  }
  
  .type-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .type-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border);
    border-radius: 2rem;
    padding: 0.6rem 1.25rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .type-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-text);
  }
  
  .type-btn.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  
  .type-icon {
    font-size: 1rem;
  }
  
  .submit-btn {
    width: 100%;
    background: var(--color-accent);
    border: none;
    border-radius: 2rem;
    padding: 0.9rem;
    font-size: 1rem;
    font-weight: 600;
    color: #0a0c12;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .submit-btn:hover {
    background: #e68a00;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px -8px rgba(245, 158, 11, 0.4);
  }
  
  .submit-btn:active {
    transform: translateY(0);
  }
  
  .btn-icon {
    font-size: 1.1rem;
  }
  
  .success-panel {
    margin-top: 1.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 1.25rem;
    padding: 1.25rem;
    animation: fadeInUp 0.4s ease;
  }
  
  .success-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }
  
  .success-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    background: rgba(245, 158, 11, 0.2);
    border-radius: 50%;
    color: var(--color-accent);
    font-weight: bold;
  }
  
  .success-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
  }
  
  .success-details {
    margin-bottom: 1.25rem;
  }
  
  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.85rem;
  }
  
  .detail-item:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    color: var(--color-muted);
    font-weight: 500;
  }
  
  .detail-value {
    color: var(--color-text);
    font-weight: 500;
    text-align: right;
  }
  
  .reset-btn {
    width: 100%;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 2rem;
    padding: 0.7rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-muted);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .reset-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-text);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Responsive */
  @media (max-width: 500px) {
    .glass-card {
      padding: 1.25rem;
    }
    
    .input-row {
      flex-direction: column;
      gap: 1rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
    
    .type-buttons {
      gap: 0.5rem;
    }
    
    .type-btn {
      padding: 0.5rem 1rem;
      font-size: 0.75rem;
    }
  }
</style>

