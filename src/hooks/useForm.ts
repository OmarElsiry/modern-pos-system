import { useState, useCallback } from 'react';
import { validateField, validateForm, FieldValidation } from '../utils/validation';

interface UseFormOptions<T> {
    initialValues: T;
    validationRules?: FieldValidation;
    onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    handleChange: (field: keyof T) => (value: string) => void;
    handleBlur: (field: keyof T) => () => void;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    resetForm: () => void;
    isValid: boolean;
}

export function useForm<T extends Record<string, any>>({
    initialValues,
    validationRules = {},
    onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback(
        (field: keyof T) => (value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));

            // Validate on change if field has been touched
            if (touched[field as string] && validationRules[field as string]) {
                const error = validateField(value, validationRules[field as string]);
                setErrors((prev) => ({
                    ...prev,
                    [field]: error || '',
                }));
            }
        },
        [touched, validationRules]
    );

    const handleBlur = useCallback(
        (field: keyof T) => () => {
            setTouched((prev) => ({ ...prev, [field]: true }));

            // Validate on blur
            if (validationRules[field as string]) {
                const error = validateField(values[field], validationRules[field as string]);
                setErrors((prev) => ({
                    ...prev,
                    [field]: error || '',
                }));
            }
        },
        [values, validationRules]
    );

    const handleSubmit = useCallback(
        async (e?: React.FormEvent) => {
            if (e) {
                e.preventDefault();
            }

            // Mark all fields as touched
            const allTouched = Object.keys(values).reduce(
                (acc, key) => ({ ...acc, [key]: true }),
                {}
            );
            setTouched(allTouched);

            // Validate all fields
            const formErrors = validateForm(values, validationRules);
            setErrors(formErrors);

            // If no errors, submit
            if (Object.keys(formErrors).length === 0) {
                setIsSubmitting(true);
                try {
                    await onSubmit(values);
                } catch (error) {
                    console.error('Form submission error:', error);
                } finally {
                    setIsSubmitting(false);
                }
            }
        },
        [values, validationRules, onSubmit]
    );

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, []);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const isValid = Object.keys(errors).length === 0;

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldError,
        resetForm,
        isValid,
    };
}

export default useForm;
