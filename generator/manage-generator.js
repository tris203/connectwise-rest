import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ESLint } from 'eslint'
import { generateAPIClass } from './generator.js'
import spec from './manage-json/manage.json' with { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslint = new ESLint({ fix: true })

async function generate() {
  const {
    paths,
    components: { schemas },
  } = spec

  const tempFolder = join(__dirname, 'Manage')
  const sections = {}

  // generate temp directory
  if (!existsSync(tempFolder)) {
    mkdirSync(tempFolder)
  }

  Object.keys(paths).forEach((url) => {
    const methods = paths[url]
    const [_, section, ...rest] = url.split('/')

    if (!sections[section]) {
      sections[section] = []
    }

    sections[section].push({ url, methods })
  })

  for (const section of Object.keys(sections)) {
    const apiName = section.charAt(0).toUpperCase() + section.slice(1)
    const operations = sections[section]
    const file = generateAPIClass({ apiName, operations, generatorType: 'Manage' })
    const fileName = join(tempFolder, `${apiName}API.ts`)
    if (existsSync(fileName)) {
      rmSync(fileName)
    }
    console.log('Creating file', fileName)
    writeFileSync(fileName, file)
  }

  console.log('running eslint')
  const results = await eslint.lintFiles(['generator/Manage/**/*.ts'])
  await ESLint.outputFixes(results)
  const formatter = await eslint.loadFormatter('stylish')
  const resultText = formatter.format(results)
  console.log(resultText)

  console.log('copying files to src/')
  const files = readdirSync(tempFolder)
  files.forEach((file) => {
    const manageFolder = join(__dirname, '../src', 'Manage')
    if (!existsSync(manageFolder)) {
      mkdirSync(manageFolder)
    }
    const src = join(tempFolder, file)
    const dest = join(manageFolder, file)
    console.log(`${src} ==> ${dest}`)
    copyFileSync(src, dest)
  })
  rmSync(tempFolder, { recursive: true })
  console.log('temp folder removed')
}

console.log('generating static Manage client files')
generate().then(() => console.log('done'))
