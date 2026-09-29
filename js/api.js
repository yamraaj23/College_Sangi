// ============================================
// College Sangi - API Module
// ============================================
// This module handles all API calls to the backend server

// Mobile-optimized fetch configuration
const API_CONFIG = {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    enableCompression: true,
    cacheResponses: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes
};

// Simple cache for API responses
const apiCache = new Map();

// Network status tracking
let networkStatus = {
    isOnline: navigator.onLine,
    isSlowNetwork: false,
    connectionType: 'unknown',
    effectiveType: navigator.connection?.effectiveType || '4g'
};

// Monitor network connectivity
if ('onLine' in navigator) {
    window.addEventListener('online', () => {
        networkStatus.isOnline = true;
        console.log('📡 Network is online');
        // Retry failed requests
        retryPendingRequests();
    });

    window.addEventListener('offline', () => {
        networkStatus.isOnline = false;
        console.log('📡 Network is offline - using cached data');
    });
}

// Monitor network quality
if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
        networkStatus.effectiveType = navigator.connection.effectiveType;
        networkStatus.isSlowNetwork = navigator.connection.effectiveType === 'slow-2g' || 
                                      navigator.connection.effectiveType === '2g';
        console.log('📊 Network type:', networkStatus.effectiveType);
    });
}

// Queue for pending requests
let pendingRequests = [];

// Retry failed requests when connection is restored
async function retryPendingRequests() {
    while (pendingRequests.length > 0) {
        const request = pendingRequests.shift();
        try {
            await request();
        } catch (error) {
            console.error('Error retrying request:', error);
        }
    }
}

// Cache-aware fetch
async function cachedFetch(url, options = {}) {
    const cacheKey = url + JSON.stringify(options);
    
    // Check cache first
    if (API_CONFIG.cacheResponses && apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey);
        if (Date.now() - cached.timestamp < API_CONFIG.cacheDuration) {
            console.log('📦 Using cached response for:', url);
            return cached.data;
        } else {
            apiCache.delete(cacheKey);
        }
    }

    try {
        const response = await fetchWithTimeout(url, options);
        const data = await response.json();
        
        // Cache successful responses
        if (response.ok && API_CONFIG.cacheResponses) {
            apiCache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
        }
        
        return data;
    } catch (error) {
        // If offline, try to use expired cache
        if (!networkStatus.isOnline && apiCache.has(cacheKey)) {
            console.warn('⚠️ Using expired cache for:', url);
            return apiCache.get(cacheKey).data;
        }
        throw error;
    }
}

// Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = API_CONFIG.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            // Optimize for mobile networks
            ...(networkStatus.isSlowNetwork && { priority: 'low' })
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Retry logic with exponential backoff
async function fetchWithRetry(url, options = {}, maxRetries = API_CONFIG.retries) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await fetchWithTimeout(url, options);
            if (!response.ok && response.status >= 500) {
                throw new Error(`Server error: ${response.status}`);
            }
            return response;
        } catch (error) {
            lastError = error;
            
            if (i < maxRetries) {
                const delay = API_CONFIG.retryDelay * Math.pow(2, i);
                console.warn(`🔄 Retrying request (${i + 1}/${maxRetries}) after ${delay}ms:`, url);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

// Mobile-optimized API call
async function apiCall(url, options = {}, useCache = true) {
    if (!networkStatus.isOnline) {
        console.warn('🌐 Offline - checking cache for:', url);
        if (apiCache.has(url)) {
            return apiCache.get(url).data;
        }
        // Queue request for retry when online
        pendingRequests.push(() => apiCall(url, options, useCache));
        throw new Error('Device is offline');
    }

    try {
        if (useCache) {
            return await cachedFetch(url, options);
        } else {
            const response = await fetchWithRetry(url, options);
            return await response.json();
        }
    } catch (error) {
        console.error('API call failed:', url, error);
        throw error;
    }
}

// Clear expired cache entries
function cleanCache() {
    const now = Date.now();
    for (const [key, value] of apiCache.entries()) {
        if (now - value.timestamp > API_CONFIG.cacheDuration) {
            apiCache.delete(key);
        }
    }
}

// Run cache cleanup periodically
setInterval(cleanCache, 60000); // Every minute

async function fetchAppState() {
    try {
        const response = await apiCall('/api/state', {}, true);
        return response;
    } catch (error) {
        console.error('Failed to fetch app state:', error);
        return null;
    }
}

async function syncCollection(collection, data) {
    try {
        const response = await apiCall(`/api/sync/${collection}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }, false); // Don't cache POST requests
        return response;
    } catch (error) {
        console.error(`Failed to sync ${collection}:`, error);
        return null;
    }
}

async function savePostsToStorage() {
    if (typeof appState !== 'undefined' && appState.forumPosts) {
        await syncCollection('forum', appState.forumPosts);
    }
}

async function saveProductsToStorage() {
    if (typeof appState !== 'undefined' && appState.marketplaceProducts) {
        await syncCollection('products', appState.marketplaceProducts);
    }
}

async function saveEventsToStorage() {
    if (typeof appState !== 'undefined' && appState.events) {
        await syncCollection('events', appState.events);
    }
}

async function saveNotificationsToStorage() {
    if (typeof appState !== 'undefined' && appState.notifications) {
        await syncCollection('notifications', appState.notifications);
    }
}
