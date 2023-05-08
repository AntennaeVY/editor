import { DecoratorNode, EditorConfig, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'
import React from 'react'
import { useEmitterValues } from '../../system'
import { noop } from '../../utils/fp'
import { SandpackEditorProps } from '../../types/NodeDecoratorsProps'

export interface SandpackPayload {
  code: string
  meta: string
  language: string
}

export type SerializedSandpackNode = Spread<SandpackPayload & { type: 'sandpack'; version: 1 }, SerializedLexicalNode>

function voidEmitter() {
  let subscription = noop
  return {
    publish: () => {
      subscription()
    },
    subscribe: (cb: () => void) => {
      subscription = cb
    },
  }
}

function InternalSandpackEditor(props: SandpackEditorProps) {
  const [{ SandpackEditor }] = useEmitterValues('nodeDecorators')
  return <SandpackEditor {...props} />
}

export class SandpackNode extends DecoratorNode<JSX.Element> {
  __code: string
  __meta: string
  __language: string
  __focusEmitter = voidEmitter()

  static getType(): string {
    return 'sandpack'
  }

  static clone(node: SandpackNode): SandpackNode {
    return new SandpackNode(node.__code, node.__language, node.__meta, node.__key)
  }

  static importJSON(serializedNode: SerializedSandpackNode): SandpackNode {
    const { code, meta, language } = serializedNode
    return $createSandpackNode({
      code,
      language,
      meta,
    })
  }

  constructor(code: string, language: string, meta: string, key?: NodeKey) {
    super(key)
    this.__code = code
    this.__meta = meta
    this.__language = language
  }

  exportJSON(): SerializedSandpackNode {
    return {
      code: this.getCode(),
      language: this.getLanguage(),
      meta: this.getMeta(),
      type: 'sandpack',
      version: 1,
    }
  }

  // View
  createDOM(_config: EditorConfig): HTMLDivElement {
    return document.createElement('div')
  }

  updateDOM(): false {
    return false
  }

  getCode(): string {
    return this.getLatest().__code
  }

  getMeta(): string {
    return this.getLatest().__meta
  }

  getLanguage(): string {
    return this.getLatest().__language
  }

  setCode(code: string) {
    if (code !== this.__code) {
      this.getWritable().__code = code
    }
  }

  setMeta(meta: string) {
    if (meta !== this.__meta) {
      this.getWritable().__meta = meta
    }
  }

  setLanguage(language: string) {
    if (language !== this.__language) {
      this.getWritable().__language = language
    }
  }

  select() {
    this.__focusEmitter.publish()
  }

  decorate(): JSX.Element {
    return (
      <InternalSandpackEditor
        nodeKey={this.getKey()}
        code={this.getCode()}
        meta={this.getMeta()}
        onChange={(code) => this.setCode(code)}
        focusEmitter={this.__focusEmitter}
      />
    )
  }
}

export function $createSandpackNode({ code, language, meta }: SandpackPayload): SandpackNode {
  return new SandpackNode(code, language, meta)
}

export function $isSandpackNode(node: LexicalNode | null | undefined): node is SandpackNode {
  return node instanceof SandpackNode
}