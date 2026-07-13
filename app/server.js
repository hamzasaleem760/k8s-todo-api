const express = require('express');
const redis = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || 'redis-service';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
  socket: { host: REDIS_HOST, port: REDIS_PORT }
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function start() {
  await client.connect();

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/todos', async (req, res) => {
    const keys = await client.keys('todo:*');
    const todos = [];
    for (const key of keys) {
      todos.push(JSON.parse(await client.get(key)));
    }
    res.json(todos);
  });

  app.post('/todos', async (req, res) => {
    const id = Date.now().toString();
    const todo = { id, text: req.body.text, done: false };
    await client.set(`todo:${id}`, JSON.stringify(todo));
    res.status(201).json(todo);
  });

  app.delete('/todos/:id', async (req, res) => {
    await client.del(`todo:${req.params.id}`);
    res.status(204).send();
  });

  app.listen(PORT, () => console.log(`Todo API listening on port ${PORT}`));
}

start();
