import {
  ArrowLongDownIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowLongUpIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'

export const Layout = {
  TopToBottom: 'TopToBottom',
  BottomToTop: 'BottomToTop',
  LeftToRight: 'LeftToRight',
  RightToLeft: 'RightToLeft',
} as const

export type Layout = (typeof Layout)[keyof typeof Layout]
export interface LayoutData {
  name: string
  icon: Component
}
export const layoutDatas: Record<Layout, LayoutData> = {
  [Layout.TopToBottom]: {
    name: 'Top to bottom',
    icon: ArrowLongDownIcon,
  },
  [Layout.BottomToTop]: {
    name: 'Bottom to top',
    icon: ArrowLongUpIcon,
  },
  [Layout.LeftToRight]: {
    name: 'Left to right',
    icon: ArrowLongLeftIcon,
  },
  [Layout.RightToLeft]: {
    name: 'Right to left',
    icon: ArrowLongRightIcon,
  },
}
