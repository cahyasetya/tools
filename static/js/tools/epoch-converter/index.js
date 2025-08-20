/**
 * Epoch Converter Tool
 * Convert between Unix timestamps and human-readable dates
 */

export default class EpochConverterTool extends BaseTool {
    constructor() {
        super({
            name: 'Epoch Converter',
            inputFields: [
                { id: 'timestamp-input', name: 'Unix Timestamp', required: false },
                { id: 'datetime-input', name: 'Date Time', required: false }
            ],
            outputFields: [
                { id: 'timestamp-output', copyable: true },
                { id: 'datetime-output', copyable: true },
                { id: 'iso-output', copyable: true },
                { id: 'utc-output', copyable: true }
            ],
            buttons: [
                { id: 'to-human-btn', action: 'convertToHuman' },
                { id: 'to-timestamp-btn', action: 'convertToTimestamp' },
                { id: 'current-time-btn', action: 'getCurrentTime' },
                { id: 'clear-btn', action: 'clearAll' },
                { id: 'copy-datetime-output-btn', action: 'copyDatetimeOutput' },
                { id: 'copy-iso-output-btn', action: 'copyIsoOutput' },
                { id: 'copy-utc-output-btn', action: 'copyUtcOutput' },
                { id: 'copy-timestamp-output-btn', action: 'copyTimestampOutput' },
                { id: 'sample-timestamps-btn', action: 'loadSampleTimestamps' }
            ]
        });

        this.timezones = [
            'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
            'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 
            'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
        ];
    }

    init() {
        super.init();
        this.setupTimezoneSelectors();
        this.startRealTimeClock();
    }

    async convertToHuman() {
        const input = ui.getValue('timestamp-input').trim();
        
        if (!input) {
            ui.showMessage('Please enter a Unix timestamp', 'error');
            return;
        }

        try {
            let timestamp = parseInt(input);
            
            // Handle different timestamp formats
            if (timestamp.toString().length === 13) {
                // Milliseconds timestamp
                timestamp = timestamp / 1000;
            } else if (timestamp.toString().length === 10) {
                // Seconds timestamp (standard)
            } else if (timestamp.toString().length === 16) {
                // Microseconds timestamp
                timestamp = timestamp / 1000000;
            } else {
                throw new Error('Invalid timestamp format. Expected 10, 13, or 16 digits');
            }

            const date = new Date(timestamp * 1000);
            
            if (isNaN(date.getTime())) {
                throw new Error('Invalid timestamp');
            }

            // Generate different formats
            const localDate = date.toLocaleString();
            const isoDate = date.toISOString();
            const utcDate = date.toUTCString();

            ui.setValue('datetime-output', localDate);
            ui.setValue('iso-output', isoDate);
            ui.setValue('utc-output', utcDate);

            this.displayTimezoneConversions(date);
            this.displayTimestampFormats(Math.floor(timestamp), timestamp * 1000);
            ui.showMessage('Timestamp converted successfully', 'success');

        } catch (error) {
            ui.showMessage(`Error: ${error.message}`, 'error');
        }
    }

    async convertToTimestamp() {
        const input = ui.getValue('datetime-input').trim();
        
        if (!input) {
            ui.showMessage('Please enter a date/time', 'error');
            return;
        }

        try {
            const date = new Date(input);
            
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date format');
            }

            const timestamp = Math.floor(date.getTime() / 1000);
            const timestampMs = date.getTime();

            ui.setValue('timestamp-output', timestamp.toString());
            
            // Show additional timestamp formats
            this.displayTimestampFormats(timestamp, timestampMs);
            ui.showMessage('Date converted to timestamp successfully', 'success');

        } catch (error) {
            ui.showMessage(`Error: ${error.message}`, 'error');
        }
    }

    async getCurrentTime() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        const timestampMs = now.getTime();

        // Fill in all fields with current time
        ui.setValue('timestamp-input', timestamp.toString());
        ui.setValue('datetime-input', now.toLocaleString());
        ui.setValue('timestamp-output', timestamp.toString());
        ui.setValue('datetime-output', now.toLocaleString());
        ui.setValue('iso-output', now.toISOString());
        ui.setValue('utc-output', now.toUTCString());

        this.displayTimestampFormats(timestamp, timestampMs);
        this.displayTimezoneConversions(now);
        
        ui.showMessage('Current time loaded', 'success');
    }

    clearAll() {
        this.clearFields();
        this.clearAdditionalOutputs();
    }

    copyDatetimeOutput() {
        ui.copyElementValue('datetime-output');
    }

    copyIsoOutput() {
        ui.copyElementValue('iso-output');
    }

    copyUtcOutput() {
        ui.copyElementValue('utc-output');
    }

    copyTimestampOutput() {
        ui.copyElementValue('timestamp-output');
    }

    loadSampleTimestamps() {
        const samples = [
            { name: "Current Time", value: Math.floor(Date.now() / 1000) },
            { name: "Unix Epoch Start", value: 0 },
            { name: "Y2K", value: 946684800 },
            { name: "2024 New Year", value: 1704067200 },
            { name: "One Hour Ago", value: Math.floor(Date.now() / 1000) - 3600 },
            { name: "One Day Ago", value: Math.floor(Date.now() / 1000) - 86400 }
        ];
        
        let message = "Sample timestamps:\n\n";
        samples.forEach(sample => {
            message += `${sample.name}: ${sample.value}\n`;
        });
        
        alert(message);
    }

    // Helper methods
    displayTimestampFormats(timestamp, timestampMs) {
        const formatsElement = ui.getElement('timestamp-formats');
        if (formatsElement) {
            formatsElement.innerHTML = `
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Seconds:</span>
                        <span class="font-mono text-gray-100">${timestamp}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Milliseconds:</span>
                        <span class="font-mono text-gray-100">${timestampMs}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Microseconds:</span>
                        <span class="font-mono text-gray-100">${timestampMs * 1000}</span>
                    </div>
                </div>
            `;
        }
    }

    displayTimezoneConversions(date) {
        const timezonesElement = ui.getElement('timezone-conversions');
        if (timezonesElement) {
            const conversions = this.timezones.map(tz => {
                try {
                    const formatted = date.toLocaleString('en-US', {
                        timeZone: tz,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                    return `
                        <div class="flex justify-between">
                            <span class="text-gray-400">${tz}:</span>
                            <span class="font-mono text-gray-100">${formatted}</span>
                        </div>
                    `;
                } catch (e) {
                    return `
                        <div class="flex justify-between">
                            <span class="text-gray-400">${tz}:</span>
                            <span class="text-red-400">Error</span>
                        </div>
                    `;
                }
            }).join('');

            timezonesElement.innerHTML = `<div class="space-y-2 text-sm">${conversions}</div>`;
        }
    }

    setupTimezoneSelectors() {
        // Setup timezone selectors if they exist in the template
        const timezoneSelect = ui.getElement('timezone-select');
        if (timezoneSelect) {
            timezoneSelect.innerHTML = this.timezones.map(tz => 
                `<option value="${tz}">${tz}</option>`
            ).join('');
        }
    }

    startRealTimeClock() {
        const clockElement = ui.getElement('live-clock');
        if (clockElement) {
            const updateClock = () => {
                const now = new Date();
                const timestamp = Math.floor(now.getTime() / 1000);
                clockElement.innerHTML = `
                    <div class="text-center p-4 bg-gray-700 rounded-lg">
                        <div class="text-2xl font-bold text-blue-400">${timestamp}</div>
                        <div class="text-sm text-gray-400">${now.toLocaleString()}</div>
                        <div class="text-xs text-gray-500">Live Unix Timestamp</div>
                    </div>
                `;
            };
            
            updateClock();
            setInterval(updateClock, 1000);
        }
    }

    clearAdditionalOutputs() {
        const elementsToClear = ['timestamp-formats', 'timezone-conversions'];
        elementsToClear.forEach(id => {
            const element = ui.getElement(id);
            if (element) {
                element.innerHTML = '<p class="text-center py-8">Convert a timestamp to see different formats</p>';
            }
        });
    }

    // Utility methods for common epoch operations
    isValidTimestamp(timestamp) {
        const ts = parseInt(timestamp);
        return !isNaN(ts) && ts > 0 && ts < 4000000000; // Reasonable range
    }

    formatRelativeTime(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 60) return `${Math.floor(diff)} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
        return `${Math.floor(diff / 2592000)} months ago`;
    }

    generateTestTimestamps() {
        const now = Date.now() / 1000;
        return {
            now: Math.floor(now),
            hour_ago: Math.floor(now - 3600),
            day_ago: Math.floor(now - 86400),
            week_ago: Math.floor(now - 604800),
            month_ago: Math.floor(now - 2592000),
            year_ago: Math.floor(now - 31536000)
        };
    }
}