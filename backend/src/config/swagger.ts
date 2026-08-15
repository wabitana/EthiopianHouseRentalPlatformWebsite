import { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ethiopian Property Platform REST API',
      version: '1.0.0',
      description: `Production-ready REST API documentation for the Ethiopian Property Platform.
      
### Key Features:
- **Authentication**: JWT Bearer token authentication, Refresh Tokens, Phone OTP simulation.
- **Roles & RBAC**: ADMIN, OWNER, RENTER, BUYER (Users can hold multi-role privileges).
- **Property Management**: RENT & SALE listings with mandatory **Active Owner Subscription guard**.
- **Offline Process Handling**: Rent payments, Sale payments, and Government Tax/Legal transfers are handled offline; platform tracks process status flags.
- **Platform Payments**: Subscription payments powered by Chapa Simulation Abstraction.
- **Identity Verification**: Private National ID & Ownership License verification workflow.
- **Communication & Discovery**: Direct Messaging, Notifications, Advanced Search & Favorites.`,
      contact: {
        name: 'Backend Architecture Team',
        email: 'dev@ethioproperty.et',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid request payload' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'phone', 'password'],
          properties: {
            name: { type: 'string', example: 'Abebe Kebede' },
            email: { type: 'string', format: 'email', example: 'owner@ethioproperty.et' },
            phone: { type: 'string', example: '+251911000002' },
            password: { type: 'string', minLength: 6, example: 'Owner@123456' },
            roles: {
              type: 'array',
              items: { type: 'string', enum: ['ADMIN', 'OWNER', 'RENTER', 'BUYER'] },
              example: ['OWNER', 'RENTER'],
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['emailOrPhone', 'password'],
          properties: {
            emailOrPhone: { type: 'string', example: 'owner@ethioproperty.et' },
            password: { type: 'string', example: 'Owner@123456' },
          },
        },
        VerifyOtpInput: {
          type: 'object',
          required: ['phoneOrEmail', 'code'],
          properties: {
            phoneOrEmail: { type: 'string', example: '+251911000002' },
            code: { type: 'string', example: '123456' },
          },
        },
        CreatePropertyInput: {
          type: 'object',
          required: ['title', 'description', 'propertyType', 'transactionType', 'price', 'area', 'bedrooms', 'bathrooms', 'city', 'areaName'],
          properties: {
            title: { type: 'string', example: 'Modern 2 Bedroom Apartment in Bole' },
            description: { type: 'string', example: 'Spacious apartment near Bole Medhanealem with modern amenities.' },
            propertyType: { type: 'string', example: 'Apartment' },
            transactionType: { type: 'string', enum: ['RENT', 'SALE'], example: 'RENT' },
            price: { type: 'number', example: 35000 },
            area: { type: 'number', example: 120 },
            bedrooms: { type: 'integer', example: 2 },
            bathrooms: { type: 'integer', example: 2 },
            city: { type: 'string', example: 'Addis Ababa' },
            areaName: { type: 'string', example: 'Bole' },
            neighborhood: { type: 'string', example: 'Medhanealem' },
            addressDetails: { type: 'string', example: 'Building 4B, Apt 302' },
            images: { type: 'array', items: { type: 'string' }, example: ['/uploads/apt1.jpg'] },
          },
        },
        SubscribeInput: {
          type: 'object',
          required: ['planId'],
          properties: {
            planId: { type: 'string', example: 'sub_plan_pro_id' },
          },
        },
        CreateRentalInput: {
          type: 'object',
          required: ['propertyId'],
          properties: {
            propertyId: { type: 'string', example: 'property_uuid_here' },
            message: { type: 'string', example: 'Interested in moving in next month.' },
            moveInDate: { type: 'string', format: 'date-time', example: '2026-09-01T00:00:00Z' },
            durationMonths: { type: 'integer', example: 12 },
          },
        },
        CreateSaleInput: {
          type: 'object',
          required: ['propertyId'],
          properties: {
            propertyId: { type: 'string', example: 'property_uuid_here' },
            offerPrice: { type: 'number', example: 24500000 },
            message: { type: 'string', example: 'Initial purchase offer.' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  // Swagger UI Page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Swagger JSON raw spec endpoint (for frontend code generation)
  app.get('/api-docs/json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`?? Swagger API Documentation available at http://localhost:${env.PORT}/api-docs`);
}
