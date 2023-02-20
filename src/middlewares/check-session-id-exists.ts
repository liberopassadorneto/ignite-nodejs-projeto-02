import { FastifyReply, FastifyRequest } from 'fastify'

// Cookies <-> Formas de manter contexto entre requisições

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
