import ot, {
  astToString,
  tsRecord,
  STRING,
  UNKNOWN,
  NUMBER,
  BOOLEAN,
  tsUnion,
  COMMENT_HEADER,
} from 'openapi-typescript'
import { writeFileSync, copyFileSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import spec from './manage-json/manage.json' with { type: 'json' }
import { factory, SyntaxKind } from 'typescript'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function createPatchValuePropertyTransform(property, _schemaObject, meta) {
  if (meta.path == '#/components/schemas/PatchOperation/value') {
    return factory.updatePropertySignature(
      property,
      property.modifiers,
      property.name,
      factory.createToken(SyntaxKind.QuestionToken),
      tsUnion([tsRecord(STRING, UNKNOWN), NUMBER, STRING, BOOLEAN]),
    )
  }
  if (meta.path == '#/components/schemas/CustomFieldValue/value') {
    return factory.updatePropertySignature(
      property,
      property.modifiers,
      property.name,
      factory.createToken(SyntaxKind.QuestionToken),
      tsUnion([tsRecord(STRING, UNKNOWN), NUMBER, STRING, BOOLEAN]),
    )
  }
  return undefined
}

async function generate() {
  try {
    const options = { transformProperty: createPatchValuePropertyTransform }
    const ast = await ot(spec, options)
    const types = astToString(ast)

    const tempFile = join(__dirname, 'manage-types.ts')
    const destFile = join(__dirname, '../src/ManageTypes.ts')

    writeFileSync(tempFile, COMMENT_HEADER + types, 'utf8')
    copyFileSync(tempFile, destFile)
    rmSync(tempFile)

    console.log('types done')
  } catch (err) {
    console.error('Failed to generate Manage types:', err)
    process.exitCode = 1
  }
}

generate()
