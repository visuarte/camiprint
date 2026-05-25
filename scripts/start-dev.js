#!/usr/bin/env node
const net = require('net');
const { spawn } = require('child_process');
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

function isPortInUse(port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let called = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      called = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      if (!called) { called = true; socket.destroy(); resolve(false); }
    });
    socket.on('error', () => { if (!called) { called = true; resolve(false); } });
    socket.connect(port, '127.0.0.1');
  });
}

(async () => {
  const inUse = await isPortInUse(port);
  if (inUse) {
    console.log(`Port ${port} is already in use — not starting a new Next dev instance.`);
    process.exit(0);
  }

  console.log(`Starting Next dev on port ${port}...`);
  const args = ['dev', '--webpack', '-p', String(port)];
  const child = spawn('npx', ['next', ...args], { stdio: 'inherit', shell: true });

  child.on('exit', (code) => process.exit(code));
})();
