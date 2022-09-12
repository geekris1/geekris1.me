import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Pages from 'vite-plugin-pages'
import Unocss from 'unocss/vite'
import { presetAttributify, presetUno, transformerAttributifyJsx, presetIcons } from 'unocss'
import Markdown from 'vite-plugin-react-markdown'
import Shiki from 'markdown-it-shiki'
import anchor from 'markdown-it-anchor'
import TOC from 'markdown-it-table-of-contents'
import { slugify } from './src/utils'
export default defineConfig({
  resolve: {
    alias: [
      { find: '@/', replacement: `${resolve(__dirname, 'src')}/` },
      { find: '~/', replacement: `${resolve(__dirname, 'src/component')}/` },

    ],
  },
  plugins: [
    Unocss({
      presets: [
        presetIcons({
          extraProperties: {
            'display': 'inline-block',
            'height': '1.3em',
            'width': '1.3em',
            'vertical-align': 'text-bottom',
          },
        }),
        presetAttributify(),
        presetUno()
      ],
      transformers: [
        transformerAttributifyJsx(),
      ],
    }),
    Pages({
      extensions: ['tsx', 'md'],
    }),
    Markdown({
      wrapperClasses: 'prose m-auto',
      wrapperComponentPath: './src/component/Page',
      markdownItSetup(md) {
        md.use(Shiki, {
          theme: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          },
        })
        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3],
          slugify,
        })
      }
    }),
    react({
      include: [/\.tsx$/, /\.md$/]
    }),

  ]
})
