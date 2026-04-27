import type { Meta } from '@storybook/vue3-vite'

import GraphEditor from './GraphEditor.vue'
import { fn } from 'storybook/test'

const meta = {
  component: GraphEditor,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (story) => ({
      components: { Story: story() },
      template: `
        <div style="min-height: 100vh;">
          <Story />
        </div>
      `,
    }),
  ],
} satisfies Meta<typeof GraphEditor>

export default meta
export const Default = {
  args: {
    onChange: fn(),
  },
}
