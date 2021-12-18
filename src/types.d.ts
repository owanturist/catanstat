declare module '*.svg' {
  const content: string
  export default content
}

interface ImportMeta {
  hot?: {
    accept: Function
    dispose: Function
  }
  env: {}
}
