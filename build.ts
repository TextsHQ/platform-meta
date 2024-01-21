import fs from 'fs/promises'
import { join } from 'path'

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

  const tsc = Bun.spawnSync(["tsc"])
  if (!tsc.success) {
    console.error(tsc.stdout.toString())
    throw new Error('failed to run tsc')
  }

  console.log('✅ tsc')

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

await main()

// lint after so it doesn't slow down the build, faster feedback loop
lint()
