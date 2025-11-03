// API Configuration
// Automatically detects the API base URL based on the environment
const API_CONFIG = {
    // Use relative URLs in production, localhost in development
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : window.location.origin,
    
    // API Endpoints
    ENDPOINTS: {
        SYMPTOMS: '/api/symptoms',
        DISEASES: '/api/diseases',
        LONG_TIPS: '/api/long-tips',
        MEDICAL_REPORT: '/api/medical-report-analysis',
        PRESCRIPTION: '/api/prescription-analysis',
        IMAGE_TO_DISEASE: '/api/image-to-disease',
        HEALTH_RISK: '/api/health-risk-predictor',
        DIET_FITNESS: '/api/diet-and-fitness-plan'
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}
