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
import { action, barAction } from '@/modules/common/tutorial/hints'
import type { Tutorial } from '@/modules/common/tutorial/types'

export const bipolarBasicsTutorial: Tutorial = {
  id: 'bipolar-basics',
  name: 'Basic BAF Tutorial',
  description: 'Learn how to create arguments and connect them with attack and support relations.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Bipolar Argumentation!',
      body: [
        { text: 'Bipolar argumentation frameworks (BAFs)', tooltipId: 'BAF' },
        ' extend abstract argumentation with a second relation: besides <strong>attacks</strong>, arguments can also <strong>support</strong> one another. This tutorial shows you how to create and interact with BAFs.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'create-argument',
      title: 'Create an argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Double-tap')} on an empty area of the canvas to create a new argument.`
          : `${action('Double-click')} on an empty area of the canvas to create a new argument.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
    },
    {
      id: 'create-support',
      title: 'Draw a support',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Set the link type to ${action('Support')} using the highlighted buttons, then ${action('hold and drag')} from one argument to another to create a support relation.`
          : `Set the link type to ${action('Support')} using the highlighted buttons, then ${action('right-click')} and drag from one argument to another to create a support relation.`,
      highlight: 'linkSwitchButton',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'switch-link-type',
      title: 'Change a relation',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an existing link to select it, then tap ${barAction('switch', 'Switch')} in the action bar to flip it between attack and support.`
          : `${action('Left-click')} an existing link to open its type switcher, then pick the other relation to flip it between attack and support.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkTypeSwitchCount > baseline.linkTypeSwitchCount,
    },
    {
      id: 'delete',
      title: 'Delete an argument or relation',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an argument or relation to select it, then tap ${barAction('delete', 'Delete')} in the action bar.`
          : `${action('Right-click and hold')} on an argument or relation to delete it.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.nodeCount < baseline.nodeCount || ctx.linkCount < baseline.linkCount,
      firstBasicOnly: true,
    },
    {
      id: 'undo',
      title: 'Undo & Redo',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Made a mistake? ${action('Tap')} the <strong>Undo</strong> button to step backward through your changes. Try it now to undo the deletion.`
          : `Made a mistake? Press <kbd class="kbd kbd-sm">Ctrl Z</kbd> to undo and <kbd class="kbd kbd-sm">Ctrl Shift Z</kbd> to redo. Try it now to undo the deletion.`,
      highlight: (isTouchDevice) => (isTouchDevice ? 'undoButton' : undefined),
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.nodeCount > baseline.nodeCount || ctx.linkCount > baseline.linkCount,
      firstBasicOnly: true,
    },
    {
      id: 'done',
      title: "You're all set!",
      body: 'You can now build bipolar argumentation frameworks. Next, try the <strong>Evaluation Tutorial</strong> to see how supports affect which arguments are accepted.',
      advanceOn: 'button',
      nextTutorialId: 'bipolar-evaluation',
    },
  ],
}
