const { connect, StringCodec } = require('nats');

async function testNats() {
  try {
    console.log('Connecting to NATS server...');
    const nc = await connect({ servers: 'nats://localhost:4222' });
    console.log('Connected to NATS server!');

    const sc = StringCodec();
    
    // Subscribe to a subject
    const sub = nc.subscribe('test');
    console.log('Subscribed to "test" subject');
    
    // Process messages in the background
    (async () => {
      for await (const msg of sub) {
        console.log(`Received message: ${sc.decode(msg.data)}`);
        
        if (msg.reply) {
          console.log(`Replying to ${msg.reply}`);
          msg.respond(sc.encode('This is a reply'));
        }
      }
    })();
    
    // Publish a message
    console.log('Publishing a message to "test" subject');
    nc.publish('test', sc.encode('Hello from test script'));
    
    // Make a request
    console.log('Making a request to "test" subject');
    const resp = await nc.request('test', sc.encode('Request from test script'), { timeout: 1000 });
    console.log(`Received response: ${sc.decode(resp.data)}`);
    
    // Close the connection
    await nc.drain();
    console.log('Connection closed');
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNats(); 