import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'

export async function buildApp(
  registerRoute: (app: FastifyInstance) => Promise<void>,
  prefix?: string
): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  if (prefix) {
    await app.register(
      async (instance) => {
        await registerRoute(instance)
      },
      { prefix }
    )
  } else {
    await registerRoute(app)
  }

  return app
}
