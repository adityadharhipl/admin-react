/**
 * Format UTC Date to IST String
 * Converts UTC date to IST (Indian Standard Time) for display
 * IST = UTC + 5:30 hours
 * 
 * @param {string|Date|null|undefined} dateValue - Date value from API (ISO string, Date object, or null)
 * @param {object} options - Formatting options
 * @param {string} options.format - Format type: 'datetime' | 'date' | 'time' (default: 'datetime')
 * @param {string} options.separator - Date separator: '/' | '-' (default: '/')
 * @param {boolean} options.showSeconds - Show seconds in time (default: true)
 * @returns {string} Formatted date string in IST or 'N/A' if invalid
 * 
 * @example
 * formatUTCDate('2025-11-30T23:42:59.678Z') 
 * // Returns: '01/12/2025, 05:12:59' (IST - date shifts if needed)
 * 
 * formatUTCDate('2025-11-30T23:42:59.678Z', { format: 'date' })
 * // Returns: '01/12/2025' (IST date)
 */
export const formatUTCDate = (dateValue, options = {}) => {
    try {
        // Handle null, undefined, or empty string values
        if (!dateValue || (typeof dateValue === 'string' && dateValue.trim() === '')) {
            return 'N/A';
        }

        // Parse the date
        const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            // Don't log warning for null/undefined, only for invalid dates
            if (dateValue !== null && dateValue !== undefined) {
                console.warn('Invalid date value:', dateValue);
            }
            return 'N/A';
        }

        // Extract options with defaults
        const {
            format = 'datetime', // 'datetime' | 'date' | 'time'
            separator = '/',     // '/' | '-'
            showSeconds = true   // true | false
        } = options;

        // Convert UTC to IST: Add 5 hours 30 minutes (IST = UTC + 5:30)
        const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        const istDate = new Date(date.getTime() + istOffset);

        // Get IST components (using UTC methods after adding offset)
        const day = String(istDate.getUTCDate()).padStart(2, '0');
        const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
        const year = istDate.getUTCFullYear();
        const hours24 = istDate.getUTCHours();
        const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
        const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');

        // Convert to 12-hour format with AM/PM
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = hours24 % 12 || 12; // Convert 0 to 12, 13-23 to 1-11
        const hours = String(hours12).padStart(2, '0');

        // Format based on type
        if (format === 'date') {
            return `${day}${separator}${month}${separator}${year}`;
        }

        if (format === 'time') {
            const timeStr = showSeconds
                ? `${hours}:${minutes}:${seconds} ${ampm}`
                : `${hours}:${minutes} ${ampm}`;
            return timeStr;
        }

        // Default: datetime format
        const timeStr = showSeconds
            ? `${hours}:${minutes}:${seconds} ${ampm}`
            : `${hours}:${minutes} ${ampm}`;

        return `${day}${separator}${month}${separator}${year}, ${timeStr}`;
    } catch (error) {
        console.error('Error formatting UTC date:', error, 'Value:', dateValue);
        return 'N/A';
    }
};

/**
 * Format UTC Date for DataGrid valueFormatter
 * Wrapper function specifically for MUI DataGrid valueFormatter prop
 * Handles both direct value and object format { value }
 * 
 * @param {string|Date|object} params - Date value directly or DataGrid valueFormatter params object
 * @param {string|Date} params.value - Date value (if params is an object)
 * @returns {string} Formatted date string
 */
export const formatUTCDateForDataGrid = (params) => {
    // Handle both direct value and object format { value }
    // MUI DataGrid passes { value, field, row, ... } but we also support direct value
    let dateValue;
    if (params && typeof params === 'object' && !(params instanceof Date) && 'value' in params) {
        // It's an object with 'value' property (DataGrid format)
        dateValue = params.value;
    } else {
        // It's a direct value (string, Date, null, undefined)
        dateValue = params;
    }
    return formatUTCDate(dateValue);
};

/**
 * Format UTC Date for Export (CSV/Excel)
 * Returns formatted date string suitable for export
 * 
 * @param {string|Date|null|undefined} dateValue - Date value
 * @returns {string} Formatted date string
 */
export const formatUTCDateForExport = (dateValue) => {
    return formatUTCDate(dateValue, { format: 'datetime', separator: '/', showSeconds: true });
};

/**
 * Convert IST Date String to UTC Date String for API
 * Now returns date directly without conversion (backend expects IST dates)
 *
 * @param {string} istDateString - Date string in format "YYYY-MM-DD" (interpreted as IST)
 * @param {string} timeOfDay - "start" for start of day, "end" for end of day (not used anymore, kept for compatibility)
 * @returns {string} Date string in format "YYYY-MM-DD" or null
 *
 * @example
 * convertISTToUTCForAPI('2025-01-15', 'start')
 * // Returns: '2025-01-15' (direct return, no conversion)
 *
 * convertISTToUTCForAPI('2025-01-15', 'end')
 * // Returns: '2025-01-15' (direct return, no conversion)
 */
export const convertISTToUTCForAPI = (istDateString, timeOfDay = 'start') => {
    if (!istDateString) return null;

    try {
        // Return date directly without conversion (backend expects IST dates)
        return istDateString;
    } catch (error) {
        console.error('Error processing date:', error);
        return istDateString; // Return original if processing fails
    }
};

