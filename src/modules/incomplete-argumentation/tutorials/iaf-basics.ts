/*
 * AgonProject - The platform to explore different approaches to formal argumentation.
 *
 * Copyright (C) 2026  Artificial Intelligence Group at the Faculty of Mathematics and Computer Science of the FernUniversität in Hagen <https://www.fernuni-hagen.de/aig/en/>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import type { Tutorial } from '@/modules/common/tutorial/types'

export const iafBasicsTutorial: Tutorial = {
  id: 'iaf-basics',
  name: 'Basic iAF Tutorial',
  description: 'Learn how to create certain and uncertain arguments and attacks in incomplete AFs.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Incomplete Argumentation Frameworks!',
      body: [
        { text: 'Incomplete Argumentation Frameworks (iAFs)', tooltipId: 'IAF' },
        ' extend abstract argumentation with <strong>uncertainty</strong>: arguments and attacks can be either <em>certain</em> (always present) or <em>uncertain</em> (possibly present). You can skip this tutorial at any time and restart it from the <strong>Tutorials</strong> menu.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'create-certain-argument',
      title: 'Create a certain argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Make sure the <strong>solid circle</strong> button is active in the toolbar, then <strong>double-tap</strong> on the canvas to create a certain argument.'
          : 'Make sure the <strong>solid circle</strong> button is active in the toolbar, then <strong>double-click</strong> on the canvas to create a certain argument.',
      anchor: 'argumentModeButton',
      placement: 'right-start',
      offsetPx: 64,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
    },
    {
      id: 'create-uncertain-argument',
      title: 'Create an uncertain argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Click the <strong>dashed circle</strong> button in the toolbar to switch to uncertain argument mode, then <strong>double-tap</strong> on the canvas to create an uncertain argument. It will appear with a dashed border.'
          : 'Click the <strong>dashed circle</strong> button in the toolbar to switch to uncertain argument mode, then <strong>double-click</strong> on the canvas. It will appear with a dashed border.',
      anchor: 'argumentModeButton',
      placement: 'right-start',
      offsetPx: 64,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.uncertainNodeCount > baseline.uncertainNodeCount,
    },
    {
      id: 'create-certain-attack',
      title: 'Draw a certain attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Select <strong>Definite Attack</strong> in the link toolbar, then <strong>hold and drag</strong> from one argument to another.'
          : 'Select <strong>Definite Attack</strong> in the link toolbar, then <strong>right-click</strong> on an argument, hold, and drag towards another argument.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'create-uncertain-attack',
      title: 'Draw an uncertain attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? 'Switch to <strong>Uncertain Attack</strong> in the link toolbar, then <strong>hold and drag</strong> from one argument to another. Uncertain attacks appear as dashed arrows.'
          : 'Switch to <strong>Uncertain Attack</strong> in the link toolbar, then <strong>right-click</strong> and drag to another argument. Uncertain attacks appear as dashed arrows.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'delete',
      title: 'Delete an argument or attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? '<strong>Long-press</strong> on an argument or attack to delete it.'
          : '<strong>Right-click and hold</strong> on an argument or attack to delete it.',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.nodeCount < baseline.nodeCount || ctx.linkCount < baseline.linkCount,
    },
    {
      id: 'done',
      title: 'You\'re all set!',
      body: 'You\'ve learned the basics of incomplete argumentation frameworks. Next, try the <strong>Evaluation Tutorial</strong> to see how uncertainty affects which arguments are accepted.',
      advanceOn: 'button',
      nextTutorialId: 'iaf-evaluation',
    },
  ],
}
