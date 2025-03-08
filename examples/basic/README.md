# NestJS NATS Example

This is a simple example application that demonstrates how to use the NestJS NATS module.

## Requirements

- Node.js (v14+)
- NATS Server running on localhost:4222

## Setting up NATS Server

You can run NATS Server using Docker:

```bash
docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server nats
```

Or download and install it from the [NATS website](https://nats.io/download/).

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

### Publish a message (fire and forget)

```bash
curl -X POST http://localhost:3000/publish -H "Content-Type: application/json" -d '{"text":"Hello World"}'
```

### Request a message (request-reply)

```bash
curl -X POST http://localhost:3000/request -H "Content-Type: application/json" -d '{"text":"Hello World"}'
```

### Create an order

```bash
curl -X POST http://localhost:3000/order -H "Content-Type: application/json" -d '{"id":"123","items":[{"id":"item1","quantity":2,"price":10.99}],"total":21.98}'
```

### Queue work

```bash
curl -X POST http://localhost:3000/work -H "Content-Type: application/json" -d '{"id":"work123","type":"email","data":{"to":"user@example.com","subject":"Welcome","body":"Welcome to our service!"}}' 