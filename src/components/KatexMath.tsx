import katex from 'katex'
import 'katex/dist/katex.min.css'

export function BlockMath({ math }: { math: string }) {
  const html = katex.renderToString(math, { displayMode: true, throwOnError: false })
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

export function InlineMath({ math }: { math: string }) {
  const html = katex.renderToString(math, { displayMode: false, throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
