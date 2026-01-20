/**
 * CTools UI Utilities - Helper functions and theme system
 * Provides utilities for dynamic UI updates and theme management
 */
class UIUtils {
    constructor() {
        this.themes = this.initializeThemes();
        this.currentTheme = 'dark';
        this.animations = this.initializeAnimations();
    }

    /**
     * Initialize theme configurations
     */
    initializeThemes() {
        return {
            dark: {
                name: 'Dark',
                colors: {
                    background: 'bg-gray-900',
                    surface: 'bg-gray-800',
                    surfaceSecondary: 'bg-gray-700',
                    border: 'border-gray-700',
                    borderSecondary: 'border-gray-600',
                    text: 'text-gray-100',
                    textSecondary: 'text-gray-300',
                    textMuted: 'text-gray-400',
                    textPlaceholder: 'placeholder-gray-400',
                    shadow: 'shadow-lg'
                },
                buttons: {
                    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    secondary: 'bg-green-600 hover:bg-green-700 text-white',
                    accent: 'bg-purple-600 hover:bg-purple-700 text-white',
                    neutral: 'bg-gray-600 hover:bg-gray-700 text-white',
                    danger: 'bg-red-600 hover:bg-red-700 text-white'
                },
                inputs: {
                    base: 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400',
                    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }
            },
            light: {
                name: 'Light',
                colors: {
                    background: 'bg-gray-50',
                    surface: 'bg-white',
                    surfaceSecondary: 'bg-gray-100',
                    border: 'border-gray-200',
                    borderSecondary: 'border-gray-300',
                    text: 'text-gray-900',
                    textSecondary: 'text-gray-700',
                    textMuted: 'text-gray-500',
                    textPlaceholder: 'placeholder-gray-400',
                    shadow: 'shadow-lg'
                },
                buttons: {
                    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    secondary: 'bg-green-600 hover:bg-green-700 text-white', 
                    accent: 'bg-purple-600 hover:bg-purple-700 text-white',
                    neutral: 'bg-gray-600 hover:bg-gray-700 text-white',
                    danger: 'bg-red-600 hover:bg-red-700 text-white'
                },
                inputs: {
                    base: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
                    focus: 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }
            }
        };
    }

    /**
     * Initialize animation configurations
     */
    initializeAnimations() {
        return {
            fadeIn: 'transition-opacity duration-300 ease-in-out',
            slideIn: 'transition-transform duration-300 ease-in-out',
            scaleIn: 'transition-transform duration-200 ease-in-out hover:scale-105',
            pulse: 'animate-pulse',
            spin: 'animate-spin',
            bounce: 'animate-bounce'
        };
    }

    /**
     * Get current theme
     */
    getTheme(themeName = null) {
        return this.themes[themeName || this.currentTheme];
    }

    /**
     * Switch theme
     */
    switchTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Theme '${themeName}' not found`);
            return;
        }

        this.currentTheme = themeName;
        document.documentElement.className = themeName;
        
        // Store preference
        localStorage.setItem('ctools-theme', themeName);
        
        // Emit theme change event
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: themeName } }));
    }

    /**
     * Get responsive breakpoint classes
     */
    getResponsiveClasses(config) {
        const { sm, md, lg, xl, base = '' } = config;
        let classes = base;
        
        if (sm) classes += ` sm:${sm}`;
        if (md) classes += ` md:${md}`;
        if (lg) classes += ` lg:${lg}`;
        if (xl) classes += ` xl:${xl}`;
        
        return classes;
    }

    /**
     * Generate grid classes based on column count
     */
    getGridClasses(columns) {
        const gridMap = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
            6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
        };
        
        return `grid ${gridMap[columns] || gridMap[2]} gap-6`;
    }

    /**
     * Update button state (loading, disabled, etc.)
     */
    updateButtonState(buttonId, state) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const { loading, disabled, text, variant } = state;

        if (loading !== undefined) {
            if (loading) {
                button.innerHTML = '⏳ Processing...';
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                button.innerHTML = text || button.getAttribute('data-original-text') || 'Button';
                button.disabled = false;
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        if (disabled !== undefined) {
            button.disabled = disabled;
            if (disabled) {
                button.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                button.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        if (text !== undefined) {
            button.setAttribute('data-original-text', button.innerHTML);
            button.innerHTML = text;
        }

        if (variant !== undefined) {
            // Remove old variant classes and add new ones
            const theme = this.getTheme();
            Object.values(theme.buttons).forEach(buttonClass => {
                button.classList.remove(...buttonClass.split(' '));
            });
            button.classList.add(...theme.buttons[variant].split(' '));
        }
    }

    /**
     * Update stats display
     */
    updateStats(stats) {
        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Add animation
                element.classList.add('animate-pulse');
                setTimeout(() => element.classList.remove('animate-pulse'), 300);
            }
        });
    }

    /**
     * Show/hide elements with animation
     */
    toggleElement(elementId, show, animation = 'fadeIn') {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (show) {
            element.classList.remove('hidden');
            element.classList.add(this.animations[animation]);
        } else {
            element.classList.add('hidden');
            element.classList.remove(this.animations[animation]);
        }
    }

    /**
     * Show message with auto-dismiss
     */
    showMessage(message, type = 'info', duration = 5000) {
        const messageElement = document.getElementById('message');
        if (!messageElement) return;

        // Clear previous classes
        messageElement.className = 'mt-4 p-4 rounded-md';

        // Add type-specific classes
        const typeClasses = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white', 
            warning: 'bg-yellow-600 text-black',
            info: 'bg-blue-600 text-white'
        };

        messageElement.classList.add(...typeClasses[type].split(' '));
        messageElement.textContent = message;
        messageElement.classList.remove('hidden');

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                messageElement.classList.add('hidden');
            }, duration);
        }
    }

    /**
     * Form validation helpers
     */
    validateForm(formId, rules = {}) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const errors = {};

        Object.entries(rules).forEach(([fieldId, fieldRules]) => {
            const field = document.getElementById(fieldId);
            if (!field) return;

            const value = field.value.trim();
            const fieldErrors = [];

            // Required validation
            if (fieldRules.required && !value) {
                fieldErrors.push('This field is required');
                isValid = false;
            }

            // Pattern validation
            if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
                fieldErrors.push(fieldRules.message || 'Invalid format');
                isValid = false;
            }

            // Length validation
            if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
                fieldErrors.push(`Minimum ${fieldRules.minLength} characters required`);
                isValid = false;
            }

            if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                fieldErrors.push(`Maximum ${fieldRules.maxLength} characters allowed`);
                isValid = false;
            }

            // Custom validation
            if (value && fieldRules.validate && !fieldRules.validate(value)) {
                fieldErrors.push(fieldRules.validateMessage || 'Invalid value');
                isValid = false;
            }

            // Update field appearance
            if (fieldErrors.length > 0) {
                field.classList.add('border-red-500');
                field.classList.remove('border-gray-600');
                errors[fieldId] = fieldErrors;
            } else {
                field.classList.remove('border-red-500');
                field.classList.add('border-gray-600');
            }
        });

        return { isValid, errors };
    }

    /**
     * Copy to clipboard utility
     */
    async copyToClipboard(text, buttonId = null) {
        try {
            await navigator.clipboard.writeText(text);
            
            if (buttonId) {
                const originalText = document.getElementById(buttonId)?.innerHTML;
                this.updateButtonState(buttonId, { text: '✓ Copied!' });
                setTimeout(() => {
                    this.updateButtonState(buttonId, { text: originalText });
                }, 2000);
            }
            
            this.showMessage('Copied to clipboard!', 'success', 2000);
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            this.showMessage('Failed to copy to clipboard', 'error');
            return false;
        }
    }

    /**
     * Auto-resize textareas
     */
    enableAutoResize(textareaId) {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;

        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        };

        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('change', autoResize);
        
        // Initial resize
        autoResize();
    }

    /**
     * Debounce function for performance
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Character/word/line counter
     */
    setupCounters(inputId, counterConfig = {}) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const {
            charCountId = 'char-count',
            wordCountId = 'word-count', 
            lineCountId = 'line-count',
            bytesId = 'size-bytes'
        } = counterConfig;

        const updateCounters = this.debounce(() => {
            const text = input.value;
            
            this.updateStats({
                [charCountId]: text.length.toLocaleString(),
                [wordCountId]: text.trim() ? text.trim().split(/\s+/).length.toLocaleString() : '0',
                [lineCountId]: text.split('\n').length.toLocaleString(),
                [bytesId]: new Blob([text]).size.toLocaleString()
            });
        }, 100);

        input.addEventListener('input', updateCounters);
        input.addEventListener('change', updateCounters);
        
        // Initial update
        updateCounters();
    }

    /**
     * Initialize framework utilities
     */
    init() {
        // Load saved theme
        const savedTheme = localStorage.getItem('ctools-theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.switchTheme(savedTheme);
        }

        // Setup global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to trigger primary action
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const primaryBtn = document.querySelector('[id*="-btn"]:not([id*="copy"]):not([id*="clear"])');
                if (primaryBtn && !primaryBtn.disabled) {
                    primaryBtn.click();
                    e.preventDefault();
                }
            }

            // Escape to clear/cancel
            if (e.key === 'Escape') {
                const clearBtn = document.querySelector('[id*="clear"]');
                if (clearBtn) {
                    clearBtn.click();
                    e.preventDefault();
                }
            }
        });

        console.log('✅ UIUtils initialized');
    }
}

// Export for global use
window.UIUtils = UIUtils;