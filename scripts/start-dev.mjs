import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendRoot = path.resolve(__dirname, '..')
const frontendRoot = path.resolve(backendRoot, '..', 'MoviePilot-Frontend')
const pythonExecutable = path.join(backendRoot, 'venv', 'Scripts', 'python.exe')
const mode = process.argv[2] ?? 'all'
const validModes = new Set(['all', 'backend', 'frontend'])

const processes = []
let shuttingDown = false

if (!validModes.has(mode)) {
  console.error(`Unsupported mode: ${mode}`)
  console.error('Usage: node scripts/start-dev.mjs [all|backend|frontend]')
  process.exit(1)
}

if (mode !== 'frontend' && !fs.existsSync(pythonExecutable)) {
  console.error(`Backend python executable not found: ${pythonExecutable}`)
  process.exit(1)
}

function startProcess(name, command, args, cwd, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
    shell: process.platform === 'win32' && command === 'yarn',
  })

  child.on('exit', code => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`)
      shutdown(code)
    }
  })

  child.on('error', error => {
    console.error(`[${name}] failed to start:`, error)
    shutdown(1)
  })

  processes.push(child)
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }
  shuttingDown = true

  for (const child of processes) {
    if (!child.killed) {
      child.kill('SIGINT')
    }
  }

  setTimeout(() => process.exit(exitCode), 500)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

if (mode === 'all') {
  console.log('Starting MoviePilot backend and frontend...')
}
else {
  console.log(`Starting MoviePilot ${mode}...`)
}

if (mode === 'all' || mode === 'backend') {
  startProcess(
    'backend',
    pythonExecutable,
    ['-m', 'app.main'],
    backendRoot,
    {
      CONFIG_DIR: path.join(backendRoot, 'config'),
    },
  )
}

if (mode === 'all' || mode === 'frontend') {
  startProcess(
    'frontend',
    'yarn',
    ['dev', '--host', '0.0.0.0', '--port', '3000'],
    frontendRoot,
  )
}
