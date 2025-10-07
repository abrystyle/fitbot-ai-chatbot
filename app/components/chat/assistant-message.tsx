'use client'

import { Streamdown } from 'streamdown'
import type { MermaidConfig } from 'mermaid'

interface AssistantMessageProps {
  content: string
  className?: string
}

export function AssistantMessage({ content, className = "" }: AssistantMessageProps) {
  // Configuración personalizada para Mermaid con el tema de nuestro chatbot
  const mermaidConfig: MermaidConfig = {
    theme: 'base',
    themeVariables: {
      primaryColor: '#3b82f6', // blue-500
      primaryTextColor: '#1f2937', // gray-800
      primaryBorderColor: '#d1d5db', // gray-300
      lineColor: '#6b7280', // gray-500
      secondaryColor: '#f3f4f6', // gray-100
      tertiaryColor: '#ffffff',
      background: '#ffffff',
      mainBkg: '#ffffff',
      secondBkg: '#f9fafb', // gray-50
      tertiaryBkg: '#f3f4f6' // gray-100
    }
  }

  return (
    <div className={`max-w-none ${className}`}>
      <Streamdown
        parseIncompleteMarkdown={true}
        allowedImagePrefixes={["https://", "http://", "data:"]}
        allowedLinkPrefixes={["https://", "http://", "mailto:", "#"]}
        defaultOrigin="https://localhost:3000"
        mermaidConfig={mermaidConfig}
        shikiTheme={["github-light", "github-dark"]}
        controls={{
          table: true,
          code: true,
          mermaid: true
        }}
        className="streamdown-content"
      >
        {content}
      </Streamdown>
    </div>
  )
}