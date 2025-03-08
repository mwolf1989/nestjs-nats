# NestJS NATS JetStream Example

This is an example application that demonstrates how to use the NestJS NATS module with JetStream for persistent messaging.

## Requirements

- Node.js (v14+)
- NATS Server with JetStream enabled running on localhost:4222

## Setting up NATS Server with JetStream

You can run NATS Server with JetStream enabled using Docker:

```bash
docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server nats -js
```

Or use the provided docker-compose.yml file in the root of the project:

```bash
docker-compose up -d
```

## Installation

```bash
npm install
```

## Running the application

```bash
npm start
```

Or in development mode with auto-reload:

```bash
npm run start:dev
```

## Testing the application

Once the application is running, you can test it using curl:

### Create an Order

```bash
curl -X POST http://localhost:3001/orders -H "Content-Type: application/json" -d '{"id":"order123","items":[{"id":"item1","quantity":2,"price":10.99}],"total":21.98}'
```

### Update an Order

```bash
curl -X POST http://localhost:3001/orders/update -H "Content-Type: application/json" -d '{"id":"order123","items":[{"id":"item1","quantity":3,"price":10.99}],"total":32.97}'
```

### Delete an Order

```bash
curl -X POST http://localhost:3001/orders/delete -H "Content-Type: application/json" -d '{"id":"order123"}'
```

## How it works

This example demonstrates:

1. Setting up a JetStream stream with multiple subjects
2. Publishing messages to the stream
3. Creating a durable consumer to process messages
4. Handling acknowledgement and error recovery
5. Processing messages in a reliable way

JetStream provides persistence, guaranteed delivery, and other advanced features on top of the core NATS messaging system. 