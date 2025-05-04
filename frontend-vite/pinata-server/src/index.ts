import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
import { PinataSDK } from 'pinata'

config()

const app = new Hono()

app.use(cors())

app.get('/', (c) => c.text('Hello from local Hono!'))

app.post('/upload_metadata', async (c) => {
  const body = await c.req.json()

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL
  });

  const result = await pinata.upload.public.json(body)

  return c.json({ cid: result }) // or result.cid if that's your Pinata SDK format
})


app.get('/presigned_url', async (c) => {
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL
  });

  const result = await pinata.upload.public.createSignedURL({
    expires: 60
  });

  console.log('Presigned result:', result)

  return c.json({ url: result })
})


serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('🚀 Server running at http://localhost:3000')
