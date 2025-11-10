import openapiTS from 'openapi-typescript'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { getAutomateJson } from './automate-json.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const automate = await getAutomateJson()
const types = await openapiTS(automate)
fs.writeFileSync(path.join(__dirname, 'AutomateTypes.ts'), types)
fs.copyFileSync(
  path.join(__dirname, 'AutomateTypes.ts'),
  path.join(__dirname, '../src/Automate/AutomateTypes.ts'),
)
fs.rmSync(path.join(__dirname, 'AutomateTypes.ts'))
console.log('done')
