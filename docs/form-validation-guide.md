# Form Validation Usage Guide

## Overview

The JOECASHIER app now includes a comprehensive form validation system with:
- Real-time validation on blur and change
- Arabic error messages
- Common validation patterns (email, phone, numbers)
- Custom validation support

## Files Created

- `src/utils/validation.ts` - Validation utilities
- `src/hooks/useForm.ts` - Form state management hook

## Usage Example

### Basic Form with Validation

```tsx
import { useForm } from '../hooks/useForm';
import { patterns } from '../utils/validation';
import { Input, Button } from '../components';

interface ProductFormData {
  name: string;
  barcode: string;
  wholesalePrice: string;
  retailPrice: string;
  stockQuantity: string;
}

function ProductForm() {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm<ProductFormData>({
    initialValues: {
      name: '',
      barcode: '',
      wholesalePrice: '',
      retailPrice: '',
      stockQuantity: '',
    },
    validationRules: {
      name: {
        required: 'اسم المنتج مطلوب',
        minLength: { value: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' },
      },
      barcode: {
        required: true,
        pattern: patterns.number,
      },
      wholesalePrice: {
        required: 'سعر الجملة مطلوب',
        min: { value: 0, message: 'السعر يجب أن يكون موجباً' },
      },
      retailPrice: {
        required: 'سعر القطاعي مطلوب',
        min: { value: 0, message: 'السعر يجب أن يكون موجباً' },
        custom: (value) => {
          if (Number(value) < Number(values.wholesalePrice)) {
            return 'سعر القطاعي يجب أن يكون أكبر من سعر الجملة';
          }
        },
      },
      stockQuantity: {
        required: true,
        pattern: patterns.positiveNumber,
      },
    },
    onSubmit: async (data) => {
      // Handle form submission
      console.log('Form data:', data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="اسم المنتج"
        value={values.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={touched.name ? errors.name : undefined}
        required
      />

      <Input
        label="الباركود"
        value={values.barcode}
        onChange={handleChange('barcode')}
        onBlur={handleBlur('barcode')}
        error={touched.barcode ? errors.barcode : undefined}
        required
      />

      <Input
        label="سعر الجملة"
        type="number"
        value={values.wholesalePrice}
        onChange={handleChange('wholesalePrice')}
        onBlur={handleBlur('wholesalePrice')}
        error={touched.wholesalePrice ? errors.wholesalePrice : undefined}
        required
      />

      <Input
        label="سعر القطاعي"
        type="number"
        value={values.retailPrice}
        onChange={handleChange('retailPrice')}
        onBlur={handleBlur('retailPrice')}
        error={touched.retailPrice ? errors.retailPrice : undefined}
        required
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
      </Button>
    </form>
  );
}
```

## Validation Rules

### Required
```ts
{ required: true } // Default message: "هذا الحقل مطلوب"
{ required: 'اسم المنتج مطلوب' } // Custom message
```

### Length Validation
```ts
{
  minLength: { value: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' },
  maxLength: { value: 50, message: 'الاسم طويل جداً' },
}
```

### Number Validation
```ts
{
  min: { value: 0, message: 'السعر يجب أن يكون موجباً' },
  max: { value: 10000, message: 'السعر أكبر من الحد المسموح' },
}
```

### Pattern Validation
```ts
import { patterns } from '../utils/validation';

{
  pattern: patterns.email, // Email validation
  pattern: patterns.phone, // Phone validation
  pattern: patterns.number, // Any number
  pattern: patterns.positiveNumber, // Positive numbers only
}
```

### Custom Validation
```ts
{
  custom: (value) => {
    if (someCondition) {
      return 'رسالة خطأ مخصصة';
    }
    // Return undefined if valid
  },
}
```

## Features

- ✅ **Real-time validation** on blur and change
- ✅ **Touch tracking** - errors only show after user interaction
- ✅ **Arabic error messages** for better UX
- ✅ **Common patterns** for email, phone, numbers
- ✅ **Custom validation** for complex rules
- ✅ **Form state management** with isSubmitting, isValid
- ✅ **Type-safe** with TypeScript generics

## Integration

The existing `Input` component already supports the `error` prop, so no changes are needed to components. Simply:

1. Import `useForm` hook
2. Define validation rules
3. Connect to Input components
4. Handle submission

Forms will now show inline validation errors and prevent invalid submissions!
