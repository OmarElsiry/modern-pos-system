import { useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
    onScan: (barcode: string) => void;
    minLength?: number;
    maxLength?: number;
    timeThreshold?: number; // Time in ms to distinguish manual typing vs scanner
}

/**
 * Hook to interpret rapid keypresses as barcode scanner input.
 * Most USB scanners act as a keyboard that types very fast and ends with Enter.
 */
export const useBarcodeScanner = ({
    onScan,
    minLength = 3,
    maxLength = 50,
    timeThreshold = 50,
}: UseBarcodeScannerProps) => {
    // We use a ref to store the buffer so we don't trigger re-renders on every keypress
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime.current;

            // If the time between keys is too long, reset the buffer (it's likely manual typing)
            if (timeDiff > timeThreshold && buffer.current.length > 0) {
                buffer.current = '';
            }

            lastKeyTime.current = currentTime;

            // If Enter is pressed, check if we have a valid barcode
            if (e.key === 'Enter') {
                if (buffer.current.length >= minLength && buffer.current.length <= maxLength) {
                    // Prevent default behavior (form submission, etc.) if it's a scan
                    e.preventDefault();
                    e.stopPropagation();
                    onScan(buffer.current);
                }
                buffer.current = '';
                return;
            }

            // Ignore special keys (Shift, Ctrl, Alt, etc.) but keep printable characters
            if (e.key.length === 1) {
                if (buffer.current.length < maxLength) {
                    buffer.current += e.key;
                }
            }
        };

        // Use capture phase to handle events before other listeners if needed, 
        // or bubble phase. Usually window listener is enough.
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onScan, minLength, maxLength, timeThreshold]);
};
