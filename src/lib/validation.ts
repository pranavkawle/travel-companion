import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Mobile number validation (E.164 format)
// E.164: +[country code][subscriber number]
// Example: +61412345678 (Australia), +14155551234 (USA)
export const mobileNumberSchema = z
  .string()
  // Accepts + followed by digits, spaces, or dashes (up to 15 digits total)
  .regex(
    /^\+[1-9][0-9\s-]{1,20}$/,
    'Mobile number must be in E.164 format (e.g., +61412345678 or +61 412 345 678). Only digits, spaces, and dashes are allowed.'
  )
  // Remove spaces and dashes, then check strict E.164 digit count
  .transform((val) => val.replace(/[\s-]/g, ''))
  .refine(
    (val) => /^\+[1-9]\d{1,14}$/.test(val),
    { message: 'Mobile number must be in E.164 format with up to 15 digits after the + (e.g., +61412345678)' }
  );

// Airport code validation (IATA 3-letter codes)
export const airportCodeSchema = z
  .string()
  .length(3, 'Airport code must be exactly 3 characters')
  .transform(val => val.toUpperCase())
  .regex(/^[A-Z]{3}$/, 'Airport code must contain only letters');

// User validation
export const firstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must be 50 characters or less')
  .regex(
    /^[a-zA-Z][\w\s'-]*$/,
    "First name can only contain letters, spaces, hyphens, and apostrophes"
  );

export const languageCodeSchema = z
  .string()
  .length(2, 'Language code must be 2 characters (ISO 639-1)')
  .regex(/^[a-z]{2}$/, 'Language code must be lowercase letters');

export const languagesSchema = z
  .array(languageCodeSchema)
  .min(1, 'At least one language is required');

// Flight validation
export const flightNumberSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{1,4}$/, 'Flight number format: 2 letters + 1-4 digits (e.g., QF123)')
  .optional();

export const travelDateSchema = z.coerce
  .date()
  .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Travel date must be today or in the future',
  });

// Message validation
export const messageContentSchema = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(10000, 'Message must be 10,000 characters or less');

// Rating validation
export const ratingStarsSchema = z
  .number()
  .int('Rating must be a whole number')
  .min(1, 'Rating must be at least 1 star')
  .max(5, 'Rating must be at most 5 stars');

export const ratingFeedbackSchema = z
  .string()
  .max(500, 'Feedback must be 500 characters or less')
  .optional();

// Combined schemas for forms
export const createUserSchema = z.object({
  firstName: firstNameSchema,
  email: emailSchema,
  mobileNumber: mobileNumberSchema,
  languages: languagesSchema,
});

export const createFlightSchema = z.object({
  sourceAirport: airportCodeSchema,
  destinationAirport: airportCodeSchema,
  travelDate: travelDateSchema,
  flightNumber: flightNumberSchema,
});

export const updateFlightSchema = z
  .object({
    sourceAirport: airportCodeSchema.optional(),
    destinationAirport: airportCodeSchema.optional(),
    travelDate: travelDateSchema.optional(),
    flightNumber: flightNumberSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const searchSchema = z.object({
  sourceAirport: airportCodeSchema,
  destinationAirport: airportCodeSchema,
  travelDate: z.coerce.date().optional(),
  languages: z.array(languageCodeSchema).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
});

export const createMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  recipientId: z.string().uuid('Invalid recipient ID'),
  content: messageContentSchema,
});

export const createRatingSchema = z.object({
  flightId: z.string().uuid('Invalid flight ID'),
  rateeId: z.string().uuid('Invalid ratee ID'),
  stars: ratingStarsSchema,
  feedback: ratingFeedbackSchema,
});
