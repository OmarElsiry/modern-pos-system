// Form validation utilities

export interface ValidationRule {
    required?: boolean | string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    custom?: (value: any) => string | undefined;
}

export interface FieldValidation {
    [fieldName: string]: ValidationRule;
}

export const validateField = (value: any, rules: ValidationRule): string | undefined => {
    // Required validation
    if (rules.required) {
        const isEmpty = value === '' || value === null || value === undefined;
        if (isEmpty) {
            return typeof rules.required === 'string' ? rules.required : 'هذا الحقل مطلوب';
        }
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return undefined;

    // Min length validation
    if (rules.minLength && String(value).length < rules.minLength.value) {
        return rules.minLength.message;
    }

    // Max length validation
    if (rules.maxLength && String(value).length > rules.maxLength.value) {
        return rules.maxLength.message;
    }

    // Min value validation
    if (rules.min !== undefined && Number(value) < rules.min.value) {
        return rules.min.message;
    }

    // Max value validation
    if (rules.max !== undefined && Number(value) > rules.max.value) {
        return rules.max.message;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.value.test(String(value))) {
        return rules.pattern.message;
    }

    // Custom validation
    if (rules.custom) {
        return rules.custom(value);
    }

    return undefined;
};

export const validateForm = (
    values: Record<string, any>,
    validationRules: FieldValidation
): Record<string, string> => {
    const errors: Record<string, string> = {};

    Object.keys(validationRules).forEach((fieldName) => {
        const error = validateField(values[fieldName], validationRules[fieldName]);
        if (error) {
            errors[fieldName] = error;
        }
    });

    return errors;
};

// Common validation patterns
export const patterns = {
    email: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'البريد الإلكتروني غير صحيح',
    },
    phone: {
        value: /^[\d\s\-\+\(\)]+$/,
        message: 'رقم الهاتف غير صحيح',
    },
    number: {
        value: /^\d+(\.\d+)?$/,
        message: 'يجب إدخال رقم صحيح',
    },
    positiveNumber: {
        value: /^[1-9]\d*(\.\d+)?$/,
        message: 'يجب إدخال رقم موجب',
    },
};
