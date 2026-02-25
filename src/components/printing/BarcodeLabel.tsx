import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeLabelProps {
    value: string;
    format?: 'CODE128' | 'EAN13' | 'UPC';
    width?: number; // Bar width (usually 1-3)
    height?: number; // Bar height
    displayValue?: boolean; // Show text below barcode
    fontSize?: number;
    lineColor?: string;
    background?: string;
    margin?: number;
}

const BarcodeLabel: React.FC<BarcodeLabelProps> = ({
    value,
    format = 'CODE128',
    width = 2,
    height = 50,
    displayValue = true,
    fontSize = 14,
    lineColor = '#000000',
    background = '#ffffff',
    margin = 0,
}) => {
    const barcodeRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (barcodeRef.current && value) {
            try {
                JsBarcode(barcodeRef.current, value, {
                    format,
                    width,
                    height,
                    displayValue,
                    fontSize,
                    lineColor,
                    background,
                    margin,
                    valid: (valid) => {
                        if (!valid) {
                            console.warn('Invalid barcode value:', value);
                        }
                    }
                });
            } catch (error) {
                console.error('Error generating barcode:', error);
            }
        }
    }, [value, format, width, height, displayValue, fontSize, lineColor, background, margin]);

    if (!value) return null;

    return <svg ref={barcodeRef} className="max-w-full" />;
};

export default BarcodeLabel;
