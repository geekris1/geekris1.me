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
import matter from 'gray-matter'
import fs from 'fs-extra'
import { slugify } from './src/utils'
import { getComponent } from './src/utils/auto'
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
    Markdown({
      wrapperClasses: 'prose m-auto',
      wrapperComponentPath: './src/component/Page',
      wrapperComponent: await getComponent(),
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
    Pages({
      extensions: ['tsx', 'md'],
      extendRoute(routes) {
        function addMeta(route) {
          const path = resolve(__dirname, route.element.slice(1))
          if (path.includes('blogs')) {
            const md = fs.readFileSync(path, 'utf-8')
            const { data } = matter(md)
            route.meta = Object.assign(route.meta || {}, { frontmatter: data })
          }
        }
        if (routes.children) {
          routes.children.forEach(addMeta)
        } else {
          addMeta(routes)
        }
        return routes
      },
    }),
    react({
      include: [/\.tsx$/, /\.md$/]
    }),

  ]
})
