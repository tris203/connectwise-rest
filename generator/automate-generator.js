import { getAutomateJson } from './automate-json.js'
import path, { dirname } from 'path'
import fs from 'fs'
import { ESLint } from 'eslint'
import { generateAPIClass } from './generator.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const eslint = new ESLint({ fix: true })

async function generate() {
  const automate = getAutomateJson()
  const {
    paths,
    components: { schemas },
  } = automate

  const sections = {}

  const automateTempFolder = path.join(__dirname, 'Automate')

  if (!fs.existsSync(automateTempFolder)) {
    fs.mkdirSync(automateTempFolder)
  }

  Object.keys(paths).forEach((url) => {
    const methods = paths[url]
    const section = paths[url][Object.keys(methods).pop()].section

    if (!sections[section]) {
      sections[section] = []
    }

    sections[section].push({ url, methods })
  })

  for (const section of Object.keys(sections)) {
    const apiName = section.charAt(0).toUpperCase() + section.slice(1)
    const operations = sections[section]

    const file = generateAPIClass({ apiName, operations, generatorType: 'Automate' })
    const fileName = path.join(automateTempFolder, `${apiName}API.ts`)

    if (fs.existsSync(fileName)) {
      fs.rmSync(fileName)
    }

    console.log('Creating file', fileName)
    fs.writeFileSync(fileName, file)
  }

  console.log('running eslint')
  const results = await eslint.lintFiles(['generator/Automate/**/*.ts'])
  await ESLint.outputFixes(results)
  const formatter = await eslint.loadFormatter('stylish')
  const resultText = formatter.format(results)
  console.log('eslint results', resultText)

  console.log('copying files to src/')
  const files = fs.readdirSync(path.join(__dirname, 'Automate'))
  files.forEach((file) => {
    const automateFolder = path.join(__dirname, '../src', 'Automate')
    if (!fs.existsSync(automateFolder)) {
      fs.mkdirSync(automateFolder)
    }
    const src = path.join(automateTempFolder, file)
    const dest = path.join(automateFolder, file)
    console.log(`${src} ==> ${dest}`)
    fs.copyFileSync(src, dest)
  })
  fs.rmSync(automateTempFolder, { recursive: true })
  console.log('temp folder removed')
}

console.log('generating static Automate client files')
generate().then(() => console.log('done'))
