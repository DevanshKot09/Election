/**
 * @fileoverview Utility functions for Indian Election Assistant
 * @module utils
 * @description Reusable helper functions for common operations
 * @author Indian Election Assistant Team
 * @version 2.0.0
 */

'use strict';

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 * @example
 * sanitizeInput('<script>alert("xss")</script>') // Returns: 'scriptalert("xss")/script'
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/[<>]/g, '').trim();
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * @example
 * const debouncedSearch = debounce(searchFunction, 300);
 */
export function debounce(func, delay) {
  let timeoutId;
  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Formats a date to Indian locale
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date()) // Returns: '3 May 2026'
 */
export function formatDate(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 * @example
 * calculateDistance(28.7041, 77.1025, 28.6139, 77.2090) // Returns: ~15.2
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 * @private
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Validates Indian mobile number
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} True if valid
 * @example
 * validateMobile('9876543210') // Returns: true
 * validateMobile('123456') // Returns: false
 */
export function validateMobile(mobile) {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

/**
 * Validates Indian PIN code
 * @param {string} pincode - PIN code to validate
 * @returns {boolean} True if valid
 * @example
 * validatePincode('110001') // Returns: true
 * validatePincode('12345') // Returns: false
 */
export function validatePincode(pincode) {
  const pincodeRegex = /^[1-9]\d{5}$/;
  return pincodeRegex.test(pincode);
}

/**
 * Generates a unique ID
 * @returns {string} Unique identifier
 * @example
 * generateId() // Returns: 'id_1234567890_abc'
 */
export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Stores data in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} True if successful
 * @example
 * storageSet('userPrefs', { theme: 'dark' })
 */
export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
}

/**
 * Retrieves data from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found
 * @returns {*} Stored value or default
 * @example
 * storageGet('userPrefs', {}) // Returns stored preferences or {}
 */
export function storageGet(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Storage error:', error);
    return defaultValue;
  }
}

/**
 * Removes data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if successful
 */
export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Storage error:', error);
    return false;
  }
}

/**
 * Checks if user is online
 * @returns {boolean} True if online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 * @example
 * await copyToClipboard('Polling booth address')
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard error:', error);
    return false;
  }
}

/**
 * Formats number to Indian numbering system
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 * @example
 * formatIndianNumber(1234567) // Returns: '12,34,567'
 */
export function formatIndianNumber(num) {
  return num.toLocaleString('en-IN');
}

/**
 * Truncates text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 * @example
 * truncateText('Long text here', 10) // Returns: 'Long te...'
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Escapes HTML special characters
 * @param {string} html - HTML string
 * @returns {string} Escaped HTML
 * @example
 * escapeHtml('<div>Test</div>') // Returns: '<div>Test</div>'
 */
export function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validates email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 * @example
 * validateEmail('user@example.com') // Returns: true
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gets query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 * @example
 * getQueryParam('city') // Returns: 'delhi' from ?city=delhi
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Throttles a function call
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 * @example
 * const throttledScroll = throttle(handleScroll, 100);
 */
export function throttle(func, limit) {
  let inThrottle;
  return function throttled(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Checks if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if in viewport
 * @example
 * isInViewport(document.querySelector('.card'))
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Lazy loads an image
 * @param {HTMLImageElement} img - Image element
 * @returns {Promise<void>}
 * @example
 * await lazyLoadImage(document.querySelector('img[data-src]'))
 */
export function lazyLoadImage(img) {
  return new Promise((resolve, reject) => {
    const src = img.dataset.src;
    if (!src) {
      reject(new Error('No data-src attribute'));
      return;
    }

    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

export default {
  sanitizeInput,
  debounce,
  formatDate,
  calculateDistance,
  validateMobile,
  validatePincode,
  generateId,
  storageSet,
  storageGet,
  storageRemove,
  isOnline,
  copyToClipboard,
  formatIndianNumber,
  truncateText,
  escapeHtml,
  validateEmail,
  getQueryParam,
  throttle,
  isInViewport,
  lazyLoadImage
};

// Made with Bob
