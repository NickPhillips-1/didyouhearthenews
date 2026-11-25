import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const instanceDir = path.join(root, 'artifacts/verify/instance');
const runFile = path.join(instanceDir, 'run.json');

const command = process.argv[2];
if (command === 'daemon') {
  await daemon();
} else {
  await main(command, process.argv.slice(3));
}

async function main(cmd, args) {
  switch (cmd) {
    case 'up':
      await up();
      return;
    case 'down':
      await down();
      return;
    case 'doctor':
      await doctor();
      return;
    case 'goto':
      await send({ op: 'goto', path: args[0] || '/' });
      return;
    case 'click':
      await send({ op: 'click', name: flag(args, '--name') });
      return;
    case 'screenshot':
      await send({ op: 'screenshot', file: resolveOut(args[0]) });
      return;
    case 'aria': {
      const result = await send({ op: 'aria' });
      process.stdout.write(String(result) + '\n');
      return;
    }
    case 'text': {
      const result = await send({ op: 'text' });
      process.stdout.write(String(result) + '\n');
      return;
    }
    case 'expect': {
      const text = flag(args, '--text');
      await send({ op: 'expect', text });
      console.log(`found ${text}`);
      return;
    }
    default:
      console.error('Usage: control-news-rater up|down|doctor|goto|click --name|screenshot|aria|text|expect --text');
      process.exit(2);
  }
}

function flag(args, name) {
  const index = args.indexOf(name);
  if (index === -1 || !args[index + 1]) {
    throw new Error(`missing ${name}`);
  }
  return args[index + 1];
}

function resolveOut(file) {
  if (!file) {
    throw new Error('screenshot needs a path under artifacts/verify/evidence');
  }
  return path.isAbsolute(file) ? file : path.join(root, file);
}

async function up() {
  if (fs.existsSync(runFile)) {
    const existing = JSON.parse(fs.readFileSync(runFile, 'utf8'));
    if (alive(existing)) {
      console.log(`already up ${existing.uiUrl}`);
      return;
    }
    console.error('instance files exist but the process is dead. Run: scripts/control-news-rater down');
    process.exit(1);
  }
  fs.mkdirSync(path.join(instanceDir, 'data'), { recursive: true });
  fs.mkdirSync(path.join(root, 'artifacts/verify/evidence'), { recursive: true });

  const apiPort = await freePort(18080);
  const uiPort = await freePort(14200);
  const dataDir = path.join(instanceDir, 'data');
  const props = path.join(instanceDir, 'application-verify.properties');
  const proxy = path.join(instanceDir, 'proxy.conf.json');
  fs.writeFileSync(props, [
    `server.port=${apiPort}`,
    `spring.datasource.url=jdbc:h2:file:${dataDir}/newsrater;DB_CLOSE_ON_EXIT=FALSE`,
    'spring.h2.console.enabled=false',
    'news-rater.flags.image-backfill=false',
    ''
  ].join('\n'));
  fs.writeFileSync(proxy, JSON.stringify({
    '/api': { target: `http://127.0.0.1:${apiPort}`, secure: false, changeOrigin: true }
  }, null, 2));

  const backendLog = fs.openSync(path.join(instanceDir, 'backend.log'), 'w');
  const frontendLog = fs.openSync(path.join(instanceDir, 'frontend.log'), 'w');
  const browserLog = fs.openSync(path.join(instanceDir, 'browser.log'), 'w');
  const backend = spawn('mvn', [
    '-f', 'backend/pom.xml',
    'spring-boot:run',
    `-Dspring-boot.run.jvmArguments=-Dspring.config.additional-location=file:${props}`
  ], { cwd: root, detached: true, stdio: ['ignore', backendLog, backendLog] });
  const frontend = spawn('npx', [
    'ng', 'serve', '--host', '127.0.0.1', '--port', String(uiPort), '--proxy-config', proxy
  ], { cwd: path.join(root, 'frontend'), detached: true, stdio: ['ignore', frontendLog, frontendLog] });
  backend.unref();
  frontend.unref();

  const apiUrl = `http://127.0.0.1:${apiPort}`;
  const uiUrl = `http://127.0.0.1:${uiPort}`;
  try {
    await waitFor('backend health', async () => {
      const res = await fetch(`${apiUrl}/actuator/health`);
      if (!res.ok) return false;
      const body = await res.json();
      return body.status === 'UP';
    });
    await waitFor('frontend', async () => {
      const res = await fetch(uiUrl);
      const text = await res.text();
      return res.ok && text.includes('Did you hear the news');
    });
  } catch (err) {
    console.error(err.message);
    console.error(tail(path.join(instanceDir, 'backend.log')));
    console.error(tail(path.join(instanceDir, 'frontend.log')));
    killPid(backend.pid);
    killPid(frontend.pid);
    process.exit(1);
  }

  const portFile = path.join(instanceDir, 'browser.port');
  fs.rmSync(portFile, { force: true });
  const browser = spawn(process.execPath, [fileURLToPath(import.meta.url), 'daemon'], {
    cwd: root,
    detached: true,
    env: { ...process.env, NEWS_RATER_UI: uiUrl, NEWS_RATER_INSTANCE: instanceDir },
    stdio: ['ignore', browserLog, browserLog]
  });
  browser.unref();
  await waitFor('browser', async () => fs.existsSync(portFile));
  const browserPort = Number(fs.readFileSync(portFile, 'utf8'));
  const run = {
    uiUrl,
    apiUrl,
    uiPort,
    apiPort,
    dataDir,
    browserPort,
    pids: { backend: backend.pid, frontend: frontend.pid, browser: browser.pid }
  };
  fs.writeFileSync(runFile, JSON.stringify(run, null, 2));
  console.log(`up ${uiUrl} api ${apiUrl}`);
}

async function down() {
  if (!fs.existsSync(runFile)) {
    fs.rmSync(instanceDir, { recursive: true, force: true });
    console.log('down');
    return;
  }
  const run = JSON.parse(fs.readFileSync(runFile, 'utf8'));
  for (const pid of Object.values(run.pids || {})) {
    killPid(pid);
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
  fs.rmSync(instanceDir, { recursive: true, force: true });
  console.log('down (evidence kept in artifacts/verify/evidence)');
}

async function doctor() {
  if (!fs.existsSync(runFile)) {
    console.error('no instance. Run: scripts/control-news-rater up');
    process.exit(1);
  }
  const run = JSON.parse(fs.readFileSync(runFile, 'utf8'));
  if (!alive(run)) {
    console.error('instance is not running');
    process.exit(1);
  }
  const health = await fetch(`${run.apiUrl}/actuator/health`);
  const healthBody = await health.json();
  const page = await fetch(run.uiUrl);
  const html = await page.text();
  if (healthBody.status !== 'UP' || !html.includes('Did you hear the news')) {
    console.error('instance answered but is not usable');
    process.exit(1);
  }
  const rev = await gitRev();
  console.log(`ui ${run.uiUrl}`);
  console.log(`api ${run.apiUrl}`);
  console.log(`data ${run.dataDir}`);
  console.log(`rev ${rev}`);
  console.log('doctor ok');
}

function alive(run) {
  return Object.values(run.pids || {}).every((pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  });
}

function killPid(pid) {
  if (!pid) return;
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
}

async function send(body) {
  if (!fs.existsSync(runFile)) {
    throw new Error('no instance. Run: scripts/control-news-rater up');
  }
  const run = JSON.parse(fs.readFileSync(runFile, 'utf8'));
  const payload = JSON.stringify(body);
  const result = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: run.browserPort,
      path: '/cmd',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload) }
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const parsed = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        if (!parsed.ok) {
          reject(new Error(parsed.error || 'command failed'));
          return;
        }
        resolve(parsed.result);
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
  if (body.op !== 'aria' && body.op !== 'text') {
    console.log(body.op);
  }
  return result;
}

async function daemon() {
  const { chromium } = await import('playwright');
  const ui = process.env.NEWS_RATER_UI;
  const instance = process.env.NEWS_RATER_INSTANCE;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(ui, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('No stories yet').waitFor({ timeout: 60000 }).catch(async () => {
    await page.getByRole('link', { name: 'Did you hear the news' }).first().waitFor({ timeout: 30000 });
  });
  const server = http.createServer(async (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200);
      res.end('ok');
      return;
    }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      const result = await dispatch(page, body);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, result }));
    } catch (err) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message || String(err) }));
    }
  });
  server.listen(0, '127.0.0.1', () => {
    fs.writeFileSync(path.join(instance, 'browser.port'), String(server.address().port));
  });
  process.on('SIGTERM', async () => {
    await browser.close().catch(() => {});
    process.exit(0);
  });
}

async function dispatch(page, body) {
  if (body.op === 'goto') {
    const target = new URL(body.path || '/', process.env.NEWS_RATER_UI).toString();
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    return target;
  }
  if (body.op === 'click') {
    for (const role of ['button', 'link', 'radio']) {
      const loc = page.getByRole(role, { name: body.name });
      if (await loc.count()) {
        await loc.first().click();
        return role;
      }
    }
    throw new Error(`No button, link, or radio named "${body.name}". Run aria to see names.`);
  }
  if (body.op === 'screenshot') {
    fs.mkdirSync(path.dirname(body.file), { recursive: true });
    await page.screenshot({ path: body.file, fullPage: true });
    return body.file;
  }
  if (body.op === 'aria') {
    return page.locator('body').ariaSnapshot();
  }
  if (body.op === 'text') {
    return page.locator('body').innerText();
  }
  if (body.op === 'expect') {
    const text = await page.locator('body').innerText();
    if (!text.includes(body.text)) {
      throw new Error(`page does not include "${body.text}"`);
    }
    return body.text;
  }
  throw new Error(`unknown op ${body.op}`);
}

function freePort(start) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(start, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(freePort(start + 1)));
  });
}

async function waitFor(label, fn, timeoutMs = 180000) {
  const start = Date.now();
  let last = '';
  while (Date.now() - start < timeoutMs) {
    try {
      if (await fn()) return;
    } catch (err) {
      last = err.message || String(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`${label} was not ready within ${timeoutMs}ms. ${last}`.trim());
}

function tail(file) {
  if (!fs.existsSync(file)) return '';
  const text = fs.readFileSync(file, 'utf8');
  return text.slice(-2000);
}

function gitRev() {
  return new Promise((resolve) => {
    const child = spawn('git', ['rev-parse', '--short', 'HEAD'], { cwd: root });
    let out = '';
    child.stdout.on('data', (chunk) => {
      out += chunk;
    });
    child.on('close', () => resolve(out.trim() || 'unknown'));
  });
}
