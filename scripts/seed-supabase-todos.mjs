import fs from 'node:fs'
import { Client } from 'pg'

function loadDotEnv(path) {
  const raw = fs.readFileSync(path, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue
    const key = match[1]
    let value = match[2]
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

async function main() {
  loadDotEnv('.env')

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  await client.connect()

  await client.query(`
    create table if not exists public.todos (
      id bigint generated always as identity primary key,
      name text not null
    );
  `)

  await client.query(`insert into public.todos (name) values ('Primer todo');`)

  const { rows } = await client.query(
    'select id, name from public.todos order by id desc limit 5'
  )

  console.log(rows)

  await client.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
