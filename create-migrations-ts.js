const {
  readdirSync,
  readFileSync,
  writeFileSync
} = require('fs')
const {join} = require('path')

const dir = './drizzle'
const file = readdirSync(dir).find(f => /^0000_.*\.sql$/.test(f))
if (!file) throw new Error('No migration file found')

const content = readFileSync(join(dir, file), 'utf8').replace(/`/g, '\\`').replace(/\t/g, '  ')

const migrations = content.split('--> statement-breakpoint\n').map(c => `sql\`${c}\`,`).join('\n')

writeFileSync('./src/store/migrations.ts', `import { sql } from 'drizzle-orm'

export const migrations = [
  ${migrations}
] as const
`)
console.log('migrations.ts generated.')
