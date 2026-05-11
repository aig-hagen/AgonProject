import type { Meta } from '@storybook/vue3-vite'

import Tabs from '@/app/view/EditorTabs.vue'

const meta = {
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
export const Default = {
  args: {
    data: [
      {
        id: 0,
        name: 'tab1',
      },
      {
        id: 1,
        name: 'tab2',
      },
      {
        id: 2,
        name: '',
      },
      {
        id: 3,
        name: 'tab4',
      },
    ],
    selected: 1,
  },
}
