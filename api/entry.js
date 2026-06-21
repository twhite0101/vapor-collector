import { httpServerHandler } from 'cloudflare:node'
import app from './steam_api'

export default {
  async fetch(request, env, ctx) {{
    return httpServerHandler(app, request, env, ctx)
  }}
}
