import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

/**
 * Swagger configuration
 * This configuration sets up the OpenAPI documentation
 */
const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ESS Company API Documentation',
            version: '1.0.0',
            description: 'API documentation for the ESS Company server',
            contact: {
                name: 'API Support',
                email: 'support@ess-company.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                sessionAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'connect.sid',
                    description: 'Session cookie for authentication'
                }
            },
            schemas: {
                RegisterInput: {
                    type: 'object',
                    required: ['Username', 'Email', 'Password'],
                    properties: {
                        Username: {
                            type: 'string',
                            description: 'User name',
                            example: 'John Doe'
                        },
                        Email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'john.doe@example.com'
                        },
                        Password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password (min 8 characters, with capital, lowercase, digit and special character)',
                            example: 'Password123!'
                        }
                    }
                },
                User: {
                    type: 'object',
                    required: ['Username', 'Email', 'Password', 'Role'],
                    properties: {
                        Username: {
                            type: 'string',
                            description: 'User name',
                            example: 'John Doe'
                        },
                        Email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'john.doe@example.com'
                        },
                        Password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password (min 8 characters, with capital, lowercase, digit and special character)',
                            example: 'Password123!'
                        },
                        Role: {
                            type: 'integer',
                            description: 'User role (1 = standard user)',
                            example: 1
                        },
                        Group_Id: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of group IDs the device belongs to',
                            example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86']
                        }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['Email', 'Password'],
                    properties: {
                        Email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'john.doe@example.com'
                        },
                        Password: {
                            type: 'string',
                            format: 'password',
                            description: 'User password',
                            example: 'Password123!'
                        }
                    }
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'User ID',
                            example: '60d21b4667d0d8992e610c85'
                        },
                        Username: {
                            type: 'string',
                            description: 'User name',
                            example: 'John Doe'
                        },
                        Email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                            example: 'john.doe@example.com'
                        },
                        Role: {
                            type: 'integer',
                            description: 'User role (1 = standard user)',
                            example: 1
                        },
                        Group_Id: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of group IDs the device belongs to',
                            example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86']
                        },
                        Token: {
                            type: 'string',
                            description: 'Authentication token for the user session',
                            example: 's%3AHU-kQ6mJSOyfpO127ZJhF7-lOjEGv8Kl.G3k6cyVYY7J3y6CO5kw5ErDISnJ1VwVdvPvXRKuF3R8'
                        }
                    }
                },
                Device: {
                    type: 'object',
                    properties: {
                        IMEI: {
                            type: 'string',
                            description: 'International Mobile Equipment Identity',
                            example: '993028453606485'
                        },
                        Name: {
                            type: 'string', 
                            description: 'Device name',
                            example: 'IoT-example-0001'
                        },
                        BatterieStatus: {
                            type: 'integer',
                            description: 'last battery percentage reading',
                            example: '78'
                        },
                        DateLastConn: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last connection timestamp',
                            example: '2023-12-25T12:00:00Z'
                        },
                        DateRegister: {
                            type: 'string',
                            format: 'date-time',
                            description: 'iot registration date',
                            example: '2023-12-25T12:00:00Z'
                        },
                        Group_Id: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'List of group IDs the device belongs to',
                            example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86']
                        }
                    }
                },
                Group: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Unique group identifier',
                            example: '60d21b4667d0d8992e610c85'
                        },
                        Name: {
                            type: 'string',
                            description: 'Group name',
                            example: 'Factory A'
                        },
                        Description: {
                            type: 'string',
                            description: 'Group description',
                            example: 'Main factory floor sensors'
                        }
                    }
                },
                UpdateDeviceInput: {
                    type: 'object',
                    required: ['IMEI', 'Name', 'Group_Id'],
                    properties: {
                        IMEI: {
                            type: 'string',
                            description: 'Unique identifier of the device to update'
                        },
                        Name: {
                            type: 'string',
                            minLength: 3,
                            description: 'New device name (minimum 3 characters)'
                        },
                        Group_Id: {
                            type: 'array',
                            description: 'List of group IDs associated with the device',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                },
                PairDeviceInput: {
                    type: 'object',
                    required: ['IMEI', 'Name', 'Group_Id'],
                    properties: {
                        IMEI: {
                            type: 'string',
                            description: 'Unique identifier of the device'
                        },
                        Name: {
                            type: 'string',
                            minLength: 3,
                            description: 'Device name (minimum 3 characters)'
                        },
                        Group_Id: {
                            type: 'array',
                            description: 'List of group IDs to associate with the device',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                },
                GNSSData: {
                    type: 'object',
                    properties: {
                        latitude: {
                            type: 'number',
                            format: 'float',
                            description: 'Latitude in degrees'
                        },
                        Longitude: {
                            type: 'number',
                            format: 'float',
                            description: 'Longitude in degrees'
                        }
                    }
                }
            }
        }
    },
    apis: [path.resolve(__dirname, '../routes/*.ts')], // Path to the API routes
};

/**
 * Generate Swagger specification
 */
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 