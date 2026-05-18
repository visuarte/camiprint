import { Client } from 'pg';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const databaseUrl = process.env.DATABASE_URL?.trim();
const port = process.env.PORT?.trim() || '3002';
const origin = `http://127.0.0.1:${port}`;

if (!databaseUrl) {
  console.error('DATABASE_URL es obligatorio para la validacion end to end.');
  process.exit(1);
}

const childEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  QUOTES_REPOSITORY_DRIVER: 'postgres',
  PORT: port,
};

const runCommand = (command, args, env = process.env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} fallo con codigo ${code ?? 'null'}`));
    });

    child.on('error', reject);
  });

const waitForServerReady = async (timeoutMs = 30_000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${origin}/api/v1/health`, {
        headers: { 'x-request-id': 'req_e2e_health_probe' },
      });

      if (response.ok || response.status === 503) {
        return;
      }
    } catch {
      // El servidor aun no esta listo.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`El servidor no quedo listo en ${timeoutMs}ms`);
};

const requestJson = async (path, init) => {
  const response = await fetch(`${origin}${path}`, init);
  const body = await response.json();
  return { response, body };
};

let stdout = '';
let stderr = '';

let serverProcess = null;

const startServer = () => {
  serverProcess = spawn('npm', ['start', '--', '--port', port], {
    cwd: process.cwd(),
    env: childEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  });

  serverProcess.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    stdout += text;
    process.stdout.write(text);
  });

  serverProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    stderr += text;
    process.stderr.write(text);
  });
};

const stopServer = async () => {
  if (!serverProcess) return;
  if (serverProcess.exitCode !== null) return;

  serverProcess.kill();
  await once(serverProcess, 'exit').catch(() => undefined);
};

try {
  const db = new Client({ connectionString: databaseUrl });
  await db.connect();

  await runCommand('npm', ['run', 'db:migrate'], childEnv);

  const beforeResult = await db.query('SELECT COUNT(*)::int AS count FROM quotes');
  const beforeCount = beforeResult.rows[0].count;

  await runCommand('npm', ['run', 'build:webpack'], process.env);
  startServer();
  await waitForServerReady();

  const healthResult = await requestJson('/api/v1/health', {
    method: 'GET',
    headers: { 'x-request-id': 'req_e2e_health_webpack' },
  });

  if (healthResult.response.status !== 200) {
    throw new Error(`Health inesperado: ${healthResult.response.status} ${JSON.stringify(healthResult.body)}`);
  }

  const quotePayload = {
    name: 'Carlos Perez',
    email: 'carlos@empresa.com',
    phone: '+34 600 123 123',
    companyName: 'Camiart Eventos',
    quantity: '50-99',
    message: 'Validacion end to end con webpack y PostgreSQL',
  };

  const quoteResult = await requestJson('/api/v1/quotes', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'req_e2e_quote_webpack',
      'x-forwarded-for': '203.0.113.88',
    },
    body: JSON.stringify(quotePayload),
  });

  if (quoteResult.response.status !== 201) {
    throw new Error(`Quote inesperado: ${quoteResult.response.status} ${JSON.stringify(quoteResult.body)}`);
  }

  const afterResult = await db.query('SELECT COUNT(*)::int AS count FROM quotes');
  const afterCount = afterResult.rows[0].count;

  if (afterCount !== beforeCount + 1) {
    throw new Error(`Persistencia inesperada: antes=${beforeCount}, despues=${afterCount}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        healthStatus: healthResult.body.data?.status,
        createdQuoteId: quoteResult.body.data?.id,
        beforeCount,
        afterCount,
      },
      null,
      2
    )
  );

  await db.end();
} catch (error) {
  console.error('Fallo en la validacion end to end de quotes sobre PostgreSQL.');
  console.error(error);
  console.error(stdout);
  console.error(stderr);
  process.exitCode = 1;
} finally {
  await stopServer();
}