import fs from 'fs/promises'
import {join} from 'path'

async function createMigrationsTsFile() {
  const dir = './drizzle'
  const file = (await fs.readdir(dir)).find(f => /^0000_.*\.sql$/.test(f))
  if (!file) throw new Error('No migration file found')

  try {
    await fs.unlink('./src/store/migrations.generated.ts')
  } catch (e) {
    // ignore
  }

  const content = (await Bun.file(`./drizzle/${file}`).text()).replace(/`/g, '\\`').replace(/\t/g, '  ')

  const migrations = content.split('--> statement-breakpoint\n').map(c => `sql\`${c}\`,`).join('\n')

  Bun.write('./src/store/migrations.generated.ts', `import { sql } from 'drizzle-orm'

export const migrations = [
  ${migrations}
] as const
`)
  console.log('✅ ./src/store/migrations.generated.ts generated')
}

const copyDir = async (srcDir: string, destDir: string): Promise<void> => {
  await fs.mkdir(destDir, {recursive: true})

  const entries = await fs.readdir(srcDir, {withFileTypes: true})

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name)
    const destPath = join(destDir, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await Bun.write(Bun.file(destPath), Bun.file(srcPath))
    }
  }
}

async function buildPlatform(platform: 'instagram' | 'facebook' | 'messenger') {
  try {
    const platformPath = `platform-${platform}`
    console.log(`✅ built ${platformPath}`)
  } catch (e) {
    console.error('failed to build', platform, e)
  }
}

async function main() {
  const drizzleKitGenerate = Bun.spawnSync(["bunx", "drizzle-kit", "generate:sqlite"])
  if (!drizzleKitGenerate.success) {
    console.error(drizzleKitGenerate.stdout.toString())
    throw new Error('failed to run bunx drizzle-kit generate:sqlite')
  }
  console.log('✅ drizzled')

  await createMigrationsTsFile()
  const tsc = Bun.spawnSync(["tsc"])
  if (!tsc.success) {
    console.error(tsc.stdout.toString())
    throw new Error('failed to run tsc')
  }

  console.log('✅ tsc')
  await copyDir('./drizzle', `./dist/store/drizzle`)

  await Promise.all([
    buildPlatform('instagram'),
    buildPlatform('messenger'),
    buildPlatform('facebook'),
  ])
}

function lint() {
  const lint = Bun.spawnSync(["bun", "run", "lint"])

  if (!lint.success) {
    console.error(lint.stdout.toString())
    throw new Error('failed to lint')
  }
  console.log('✅ no lint issues, you are amazing')
}

main()

// lint after so it doesn't slow down the build, faster feedback loop
lint()
