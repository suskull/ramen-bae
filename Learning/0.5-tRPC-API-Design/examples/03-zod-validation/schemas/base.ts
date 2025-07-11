/**
 * Base Schemas and Utilities
 * 
 * Common validation patterns that can be reused across the application.
 * This promotes consistency and reduces code duplication.
 */

import { z } from 'zod';

// ===== PRIMITIVE SCHEMAS =====

/**
 * Email validation with normalization
 * Transforms to lowercase and trims whitespace
 */
export const EmailSchema = z.string()
  .email('Please enter a valid email address')
  .transform(email => email.toLowerCase().trim());

/**
 * Name validation with normalization
 * Trims whitespace and validates length
 */
export const NameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .transform(name => name.trim());

/**
 * Password validation with security requirements
 */
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Phone number validation
 * Supports international formats
 */
export const PhoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .transform(phone => phone.replace(/\s/g, '')); // Remove spaces

/**
 * URL validation
 */
export const UrlSchema = z.string()
  .url('Please enter a valid URL')
  .transform(url => url.toLowerCase());

/**
 * UUID validation
 */
export const UuidSchema = z.string()
  .uuid('Invalid ID format');

// ===== DATE SCHEMAS =====

/**
 * Past date validation (for birth dates, etc.)
 */
export const PastDateSchema = z.date()
  .max(new Date(), 'Date cannot be in the future');

/**
 * Future date validation (for events, deadlines, etc.)
 */
export const FutureDateSchema = z.date()
  .min(new Date(), 'Date must be in the future');

/**
 * Date range validation
 */
export const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ===== COMMON OBJECT SCHEMAS =====

/**
 * Address schema with international support
 */
export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  zipCode: z.string().min(1, 'ZIP/Postal code is required'),
  country: z.string()
    .length(2, 'Use 2-letter country code (e.g., US, CA, UK)')
    .transform(country => country.toUpperCase()),
});

/**
 * Money/Currency schema
 */
export const MoneySchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  currency: z.string()
    .length(3, 'Use 3-letter currency code (e.g., USD, EUR)')
    .transform(currency => currency.toUpperCase()),
});

/**
 * File upload schema
 */
export const FileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().positive('File size must be positive'),
  type: z.string().min(1, 'File type is required'),
  url: UrlSchema.optional(),
});

// ===== VALIDATION UTILITIES =====

/**
 * Create an array schema with length constraints
 */
export const createArraySchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
  options: {
    min?: number;
    max?: number;
    unique?: boolean;
  } = {}
) => {
  let schema = z.array(itemSchema);

  if (options.min !== undefined) {
    schema = schema.min(options.min, `At least ${options.min} items required`);
  }

  if (options.max !== undefined) {
    schema = schema.max(options.max, `Maximum ${options.max} items allowed`);
  }

  if (options.unique) {
    schema = schema.refine(
      items => new Set(items).size === items.length,
      'Duplicate items are not allowed'
    );
  }

  return schema;
};

/**
 * Create an optional field that becomes required if condition is met
 */
export const conditionalRequired = <T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: any) => boolean,
  message: string
) => {
  return schema.optional().refine(
    (value, ctx) => {
      const parent = ctx.path.length > 0 ? ctx.parent : ctx;
      return !condition(parent) || value !== undefined;
    },
    message
  );
};

/**
 * Create a string schema that doesn't allow only whitespace
 */
export const NonEmptyStringSchema = (message = 'This field cannot be empty') =>
  z.string()
    .transform(str => str.trim())
    .refine(str => str.length > 0, message);

/**
 * Create an enum schema with custom error message
 */
export const createEnumSchema = <T extends [string, ...string[]]>(
  values: T,
  name: string
) => {
  return z.enum(values, {
    errorMap: () => ({
      message: `${name} must be one of: ${values.join(', ')}`,
    }),
  });
};

// ===== CUSTOM REFINEMENTS =====

/**
 * Check if two fields match (for password confirmation)
 */
export const matchingFields = (
  field1: string,
  field2: string,
  message = 'Fields do not match'
) => {
  return (data: Record<string, any>) => data[field1] === data[field2];
};

/**
 * At least one field must be provided
 */
export const atLeastOne = (
  fields: string[],
  message = 'At least one field must be provided'
) => {
  return (data: Record<string, any>) => {
    return fields.some(field => 
      data[field] !== undefined && 
      data[field] !== null && 
      data[field] !== ''
    );
  };
};

/**
 * Validate that a value is unique in an array
 */
export const uniqueInArray = <T>(
  getValue: (item: T) => any,
  message = 'Duplicate values are not allowed'
) => {
  return (array: T[]) => {
    const values = array.map(getValue);
    return new Set(values).size === values.length;
  };
};

// ===== EXAMPLE COMPOSITE SCHEMAS =====

/**
 * User preferences schema
 */
export const UserPreferencesSchema = z.object({
  theme: createEnumSchema(['light', 'dark', 'auto'], 'Theme'),
  language: z.string()
    .length(2, 'Use 2-letter language code')
    .transform(lang => lang.toLowerCase()),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  timezone: z.string()
    .min(1, 'Timezone is required')
    .default('UTC'),
});

/**
 * Contact information schema
 */
export const ContactInfoSchema = z.object({
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  address: AddressSchema.optional(),
  socialMedia: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    website: UrlSchema.optional(),
  }).optional(),
});

// ===== TRANSFORMATION HELPERS =====

/**
 * Transform string to number with validation
 */
export const StringToNumberSchema = z.string()
  .transform(str => parseFloat(str))
  .refine(num => !isNaN(num), 'Must be a valid number');

/**
 * Transform comma-separated string to array
 */
export const CommaSeparatedSchema = z.string()
  .transform(str => str.split(',').map(item => item.trim()).filter(Boolean));

/**
 * Transform string to boolean
 */
export const StringToBooleanSchema = z.string()
  .transform(str => str.toLowerCase() === 'true')
  .pipe(z.boolean());

// ===== EXPORT COLLECTIONS =====

/**
 * All primitive schemas for easy import
 */
export const primitives = {
  Email: EmailSchema,
  Name: NameSchema,
  Password: PasswordSchema,
  Phone: PhoneSchema,
  Url: UrlSchema,
  Uuid: UuidSchema,
  NonEmptyString: NonEmptyStringSchema,
} as const;

/**
 * All composite schemas for easy import
 */
export const composites = {
  Address: AddressSchema,
  Money: MoneySchema,
  File: FileSchema,
  UserPreferences: UserPreferencesSchema,
  ContactInfo: ContactInfoSchema,
  DateRange: DateRangeSchema,
} as const;

/**
 * All utilities for easy import
 */
export const utils = {
  createArraySchema,
  conditionalRequired,
  createEnumSchema,
  matchingFields,
  atLeastOne,
  uniqueInArray,
} as const; 