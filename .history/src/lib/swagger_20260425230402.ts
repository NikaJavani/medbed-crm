import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedBed CRM API',
      version: '1.0.0',
      description:
        'Service & Maintenance CRM for robotic hospital beds. Manages hospitals, assets, tickets, technician dispatch, and service reports.',
      contact: {
        name: 'MedBed Technologies',
        email: 'admin@medbed.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        Organization: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Hospital Kuala Lumpur' },
            type: { type: 'string', enum: ['hospital', 'vendor'] },
            city: { type: 'string', example: 'Kuala Lumpur' },
            country: { type: 'string', example: 'Malaysia' },
            contractTier: { type: 'string', enum: ['basic', 'premium', 'enterprise'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string', example: 'Ahmad' },
            lastName: { type: 'string', example: 'Razali' },
            email: { type: 'string', format: 'email' },
            role: {
              type: 'string',
              enum: ['hospital_staff', 'hospital_admin', 'technician', 'manager', 'vendor_admin'],
            },
            phone: { type: 'string', example: '+60123456789' },
            isActive: { type: 'boolean' },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            serialNumber: { type: 'string', example: 'MB-X200-001' },
            ward: { type: 'string', example: 'ICU' },
            floor: { type: 'string', example: '3' },
            status: {
              type: 'string',
              enum: ['operational', 'under_maintenance', 'decommissioned', 'pending_inspection'],
            },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ticketNumber: { type: 'string', example: 'TKT-2026-00001' },
            title: { type: 'string', example: 'Elevation motor not responding' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            category: {
              type: 'string',
              enum: ['mechanical', 'electrical', 'software', 'preventive_maintenance', 'other'],
            },
            status: {
              type: 'string',
              enum: ['open', 'acknowledged', 'in_progress', 'pending_parts', 'resolved', 'closed', 'cancelled'],
            },
            slaDeadline: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication — register and login' },
      { name: 'Organizations', description: 'Hospital and vendor management' },
      { name: 'Users', description: 'User profiles and management' },
      { name: 'Assets', description: 'Robotic bed models and physical assets' },
      { name: 'Tickets', description: 'Service tickets, assignments, and reports' },
      { name: 'Analytics', description: 'Business intelligence — ticket stats, asset health, technician performance' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)