import type { AttributifyAttributes } from 'unocss/presetAttributify'

declare module 'react' {
  interface HTMLAttributes<T> extends AttributifyAttributes { }
}



