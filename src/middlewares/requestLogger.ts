import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  // Ignora logs durante a execução dos testes para manter o console limpo
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const start = Date.now();
  const { method, originalUrl, body, query } = req;
  const bodyInfo = body && Object.keys(body).length ? `\n  - Body: ${JSON.stringify(body)}` : '';
  const queryInfo = query && Object.keys(query).length ? `\n  - Query: ${JSON.stringify(query)}` : '';

  console.info(`\n\x1b[36m[REQ]\x1b[0m ${method.padEnd(7)} ${originalUrl}${bodyInfo}${queryInfo}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.info(`${statusColor}[RES] [${status}]${reset} ${method.padEnd(7)} ${originalUrl} - ${duration}ms`);
  });

  next();
};
