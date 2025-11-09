const ot = require('openapi-typescript')
const openapiTS = ot.default || ot
const astToString = ot.astToString
const fs = require('fs')
const path = require('path')
const spec = require('./manage-json/manage.json')
const ts = require('typescript')

const tsRecord = ot.tsRecord
const STRING = ot.STRING
const UNKNOWN = ot.UNKNOWN
const NUMBER = ot.NUMBER
const BOOLEAN = ot.BOOLEAN
const tsUnion = ot.tsUnion

function createPatchValuePropertyTransform(property, _schemaObject, meta) {
  if (meta.path == '#/components/schemas/PatchOperation/value') {
    return ts.factory.updatePropertySignature(
      property,
      property.modifiers,
      property.name,
      ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      tsUnion([tsRecord(STRING, UNKNOWN), NUMBER, STRING, BOOLEAN]),
    )
  }
  return undefined
}

async function generate() {
  try {
    const options = { transformProperty: createPatchValuePropertyTransform }
    const ast = await openapiTS(spec, options)
    const types = astToString(ast)

    const tempFile = path.join(__dirname, 'manage-types.ts')
    const destFile = path.join(__dirname, '../src/ManageTypes.ts')

    fs.writeFileSync(tempFile, ot.COMMENT_HEADER + types, 'utf8')
    fs.copyFileSync(tempFile, destFile)
    fs.rmSync(tempFile)

    console.log('done')
  } catch (err) {
    console.error('Failed to generate Manage types:', err)
    process.exitCode = 1
  }
}

generate()
