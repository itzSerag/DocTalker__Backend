import dotenv from 'dotenv';
dotenv.config();

import Joi from 'joi';
import logger from '../utils/logger';

export interface EnvConfig {
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';
    BASE_URL: string;
    CORS_ORIGIN: string;
    FRONTEND_URL: string;
    RATE_LIMIT_MAX: number;
    SESSION_SECRET: string;
    LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

    // Database
    MONGO_URI: string;

    // JWT
    JWT_SECRET_KEY: string;
    JWT_EXPIRE_TIME: string;

    // Brevo Email
    BREVO_API_KEY: string;
    BREVO_SENDER_EMAIL: string;
    BREVO_SENDER_NAME: string;

    // AWS S3 Storage
    AWS_BUCKET_REGION?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_BUCKET_NAME?: string;
    AWS_S3_BUCKET_NAME?: string;

    // Google OAuth
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;

    // AI Providers
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    GEMINI_API_KEY?: string;
    GEMINI_MODEL?: string;
    HUGGING_FACE_KEY?: string;
    HUGGINGFACE_EMBEDDING_MODEL?: string;

    // Stripe Payment
    STRIPE_SECRET_KEY?: string;
}

const envSchema = Joi.object({
    // Server & Core
    PORT: Joi.number().port().default(5000),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    BASE_URL: Joi.when('NODE_ENV', {
        is: 'production',
        then: Joi.string()
            .uri({ scheme: ['https'] })
            .required(),
        otherwise: Joi.string().default('http://localhost:5000'),
    }),
    CORS_ORIGIN: Joi.when('NODE_ENV', {
        is: 'production',
        then: Joi.string()
            .required()
            .custom((value, helpers) => {
                const origins = value.split(',').map((origin: string) => origin.trim());
                for (const origin of origins) {
                    try {
                        const parsed = new URL(origin);
                        if (parsed.protocol !== 'https:' || parsed.origin !== origin)
                            return helpers.error('any.invalid');
                    } catch {
                        return helpers.error('any.invalid');
                    }
                }
                return value;
            })
            .messages({ 'any.invalid': 'CORS_ORIGIN must list explicit HTTPS frontend origins in production.' }),
        otherwise: Joi.string().default('*'),
    }),
    FRONTEND_URL: Joi.when('NODE_ENV', {
        is: 'production',
        then: Joi.string()
            .uri({ scheme: ['https'] })
            .required(),
        otherwise: Joi.string().uri().default('http://localhost:5173'),
    }),
    RATE_LIMIT_MAX: Joi.number().positive().default(300),
    SESSION_SECRET: Joi.string().required().messages({
        'any.required': 'SESSION_SECRET is required for session cookies.',
    }),
    LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('debug'),

    // Database
    MONGO_URI: Joi.string().required().messages({
        'any.required': 'MONGO_URI is required to connect to MongoDB.',
    }),

    // JWT
    JWT_SECRET_KEY: Joi.string().required().messages({
        'any.required': 'JWT_SECRET_KEY is required to sign and verify tokens.',
    }),
    JWT_EXPIRE_TIME: Joi.string().default('30d'),

    // Brevo Email
    BREVO_API_KEY: Joi.string().required().messages({
        'any.required': 'BREVO_API_KEY is required to send transactional emails.',
    }),
    BREVO_SENDER_EMAIL: Joi.string().email().default('no-reply@doctalker.com'),
    BREVO_SENDER_NAME: Joi.string().default('DocTalker'),

    // AWS S3
    AWS_BUCKET_REGION: Joi.string().default('us-east-1'),
    AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
    AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
    AWS_BUCKET_NAME: Joi.string().allow('').optional(),
    AWS_S3_BUCKET_NAME: Joi.string().allow('').optional(),

    // Google OAuth
    GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
    GOOGLE_CALLBACK_URL: Joi.string().allow('').optional(),

    // AI Providers
    OPENAI_API_KEY: Joi.string().allow('').optional(),
    OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
    GEMINI_API_KEY: Joi.string().allow('').optional(),
    GEMINI_MODEL: Joi.string().default('gemini-3.5-flash'),
    HUGGING_FACE_KEY: Joi.string().allow('').optional(),
    HUGGINGFACE_EMBEDDING_MODEL: Joi.string().default('sentence-transformers/all-MiniLM-L6-v2'),

    // Stripe
    STRIPE_SECRET_KEY: Joi.string().allow('').optional(),
}).unknown(true);

export const validateEnv = (): EnvConfig => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
    });

    if (error) {
        const errorDetails = error.details.map((detail) => ` - ${detail.message}`).join('\n');
        logger.fatal(`\n❌ Invalid Environment Configuration:\n${errorDetails}\n`);
        process.exit(1);
    }

    // Sync defaulted values back into process.env for downstream compatibility
    Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined && typeof val !== 'object') {
            process.env[key] = String(val);
        }
    });

    // Ensure AWS bucket name compatibility
    if (!process.env.AWS_BUCKET_NAME && process.env.AWS_S3_BUCKET_NAME) {
        process.env.AWS_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
    }

    logger.info('Environment variables validated successfully');
    return value as EnvConfig;
};

export const env = validateEnv();
export default env;
