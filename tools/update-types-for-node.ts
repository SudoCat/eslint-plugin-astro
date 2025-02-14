import { AST_NODE_TYPES } from "@typescript-eslint/types"
import { parseForESLint } from "astro-eslint-parser"
import path from "path"
import { formatAndSave } from "./lib/utils"

// import { fileURLToPath } from "url"
// const filename = fileURLToPath(import.meta.url)
const dirname = __dirname // path.dirname(filename)
const codeFilename = path.join(dirname, "../src/types-for-node.ts")
const { visitorKeys } = parseForESLint("")

const esNextNodeNames = ["Decorator", "ImportAttribute", "AccessorProperty"]
const esAstroNodeNames = ["Program"]
const tsEsNodeNames = Object.keys(AST_NODE_TYPES).filter(
  (k) => k !== "Program" && !k.startsWith("JSX"),
)
const esNodeNames = tsEsNodeNames.filter(
  (k) =>
    !k.startsWith("TS") && !k.startsWith("JSX") && !esNextNodeNames.includes(k),
)
const tsNodeNames = tsEsNodeNames.filter(
  (k) => !k.startsWith("JSX") && !esNodeNames.includes(k),
)
const astroNodeNames = Object.keys(visitorKeys).filter(
  (k) => !tsEsNodeNames.includes(k) && !k.startsWith("Experimental"),
)

let code = `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
import type { TSESTree, AST_NODE_TYPES } from "@typescript-eslint/types";
import type { AST } from "astro-eslint-parser"
import type * as ESTree from "estree"

export type ASTNode =
  | AST.AstroNode
  | AST.JSXNode
  | Exclude<ESTree.Node, { type: AST.JSXNode["type"] }>
  | Exclude<
      TSESTree.Node,
      { type: ESTree.Node["type"] } | { type: AST.JSXNode["type"] }
    >
export type ASTNodeWithParent =
  | (Exclude<ASTNode, ESTree.Program> & { parent: ASTNodeWithParent })
  | AST.AstroProgram

export type ASTNodeListener = {
`
for (const nodeType of tsEsNodeNames) {
  let argType = `TSESTree.${nodeType}`
  if (nodeType === "TSIntrinsicKeyword") {
    argType = `TSESTree.Node & { type: AST_NODE_TYPES.${nodeType}}`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
  "${nodeType}:exit"?: (node: ${argType} & ASTNodeWithParent) => void
`
}
for (const nodeType of astroNodeNames) {
  let argType = `AST.${nodeType}`
  if (nodeType === "Program") {
    argType = `AST.AstroProgram`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
  "${nodeType}:exit"?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

code += `
export type ESNodeListener = {
`
for (const nodeType of esNodeNames) {
  const argType = `ESTree.${nodeType}`
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
  "${nodeType}:exit"?: (node: ${argType} & ASTNodeWithParent) => void
`
}
for (const nodeType of esAstroNodeNames) {
  let argType = `AST.${nodeType}`
  if (nodeType === "Program") {
    argType = `AST.AstroProgram`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
  "${nodeType}:exit"?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

code += `
export type TSNodeListener = {
`
for (const nodeType of tsNodeNames) {
  let argType = `TSESTree.${nodeType}`
  if (nodeType === "TSIntrinsicKeyword") {
    argType = `TSESTree.Node & { type: AST_NODE_TYPES.${nodeType}}`
  }
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
  "${nodeType}:exit"?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

code += `
export type AstroNodeListener = {
`
for (const nodeType of astroNodeNames.filter(
  (k) => !esAstroNodeNames.includes(k),
)) {
  const argType = `AST.${nodeType}`
  code += `  ${nodeType}?: (node: ${argType} & ASTNodeWithParent) => void
  "${nodeType}:exit"?: (node: ${argType} & ASTNodeWithParent) => void
`
}
code += `
}`

void formatAndSave(codeFilename, code)
