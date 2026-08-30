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
        ' extend abstract argumentation with <strong>uncertainty</strong>: arguments and attacks can be either <em>certain</em> (always present) or <em>uncertain</em> (possibly present).',
      ],
      advanceOn: 'button',
    },
    {
      id: 'create-certain-argument',
      title: 'Create a certain argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Make sure the <strong>solid circle</strong> mode is active, then ${action('double-tap')} on the canvas to create a certain argument.`
          : `Make sure the <strong>solid circle</strong> mode is active, then ${action('double-click')} on the canvas to create a certain argument.`,
      highlight: 'argumentModeButton',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
    },
    {
      id: 'create-uncertain-argument',
      title: 'Create an uncertain argument',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Switch to the <strong>dashed circle</strong> mode, then ${action('double-tap')} on the canvas to create an uncertain argument. It appears with a dashed border.`
          : `Switch to the <strong>dashed circle</strong> mode, then ${action('double-click')} on the canvas to create an uncertain argument. It appears with a dashed border.`,
      highlight: 'argumentModeButton',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.uncertainNodeCount > baseline.uncertainNodeCount,
    },
    {
      id: 'create-uncertain-attack',
      title: 'Draw an uncertain attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Set the link type to <strong>Uncertain Attack</strong> using the highlighted buttons, then ${action('hold and drag')} from one argument to another. Uncertain attacks appear as dashed arrows.`
          : `Set the link type to <strong>Uncertain Attack</strong> using the highlighted buttons, then ${action('right-click')} and drag to another argument. Uncertain attacks appear as dashed arrows.`,
      highlight: 'linkSwitchButton',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.uncertainLinkCount > baseline.uncertainLinkCount,
    },
    {
      id: 'switch-type',
      title: 'Flip between certain and uncertain',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an argument or attack, then tap ${barAction('switch', 'Switch')} in the action bar to flip it between certain and uncertain.`
          : `${action('Left-click')} an argument or attack, then use the ${barAction('switch', 'Switch')} action to flip it between certain and uncertain.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.linkTypeSwitchCount > baseline.linkTypeSwitchCount ||
        ctx.uncertainNodeCount !== baseline.uncertainNodeCount,
    },
    {
      id: 'delete',
      title: 'Delete an argument or attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an argument or attack to select it, then tap ${barAction('delete', 'Delete')} in the action bar.`
          : `${action('Right-click and hold')} on an argument or attack to delete it.`,
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
      body: "You've learned the basics of incomplete argumentation frameworks. Next, try the <strong>Evaluation Tutorial</strong> to see how uncertainty affects which arguments are accepted.",
      advanceOn: 'button',
      nextTutorialId: 'iaf-evaluation',
    },
  ],
}
