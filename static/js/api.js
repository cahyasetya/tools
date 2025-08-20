/**
 * Centralized API client for CTools
 * Handles all API communication with consistent error handling
 */
class APIClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make API request with automatic error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return { success: true, data: data.result || data, error: null };
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            return { 
                success: false, 
                data: null, 
                error: error.message || 'Network error occurred' 
            };
        }
    }

    /**
     * POST request helper
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Base64 API methods
     */
    async encodeBase64(text) {
        return this.post('/api/base64/encode', { text });
    }

    async decodeBase64(text) {
        return this.post('/api/base64/decode', { text });
    }

    /**
     * JSON API methods
     */
    async beautifyJSON(json) {
        return this.post('/api/json/beautify', { json });
    }

    async diffJSON(json1, json2) {
        return this.post('/api/json/diff', { json1, json2 });
    }
}

// Global API client instance
const api = new APIClient();