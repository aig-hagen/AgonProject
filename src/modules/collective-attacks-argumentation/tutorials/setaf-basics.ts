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

export const setafBasicsTutorial: Tutorial = {
  id: 'setaf-basics',
  name: 'Basic SetAF Tutorial',
  description: 'Learn how to create arguments and collective attacks in SetAFs.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Argumentation with Collective Attacks!',
      body: [
        'In a ',
        { text: 'SetAF', tooltipId: 'SetAF' },
        ', attacks can come from <strong>sets of arguments</strong> rather than just single arguments. A ',
        { text: 'collective attack', tooltipId: 'collectiveAttack' },
        ' is only effective when all members of the attacking set are present. You can skip this tutorial at any time and restart it from the <strong>Tutorials</strong> menu.',
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
      id: 'single-attack',
      title: 'Draw a single-source attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Hold and drag')} from one argument towards another to create a regular (single-source) attack.`
          : `${action('Right-click')} on an argument, hold, and drag towards another argument to create a regular (single-source) attack.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.linkCount > baseline.linkCount,
    },
    {
      id: 'collective-attack',
      title: 'Draw a collective attack',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `To create a collective attack, first build the source set: ${action('Tap')} two or more arguments and choose ${barAction('add', 'Add to attack')} in the action bar for each source you want (Or you can ${action('long-press')} an argument). Then ${action('Hold and drag')} from some selected argument to the target.`
          : `To create a collective attack: ${action('Shift+Left-click')} two or more arguments to select them as sources, then ${action('Right-click')} on a selected source, hold, and drag to the target. A branching arrow will appear connecting all sources to the target.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.hyperLinkCount > baseline.hyperLinkCount,
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
        ctx.nodeCount < baseline.nodeCount ||
        ctx.linkCount < baseline.linkCount ||
        ctx.hyperLinkCount < baseline.hyperLinkCount,
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
        ctx.nodeCount > baseline.nodeCount ||
        ctx.linkCount > baseline.linkCount ||
        ctx.hyperLinkCount > baseline.hyperLinkCount,
      firstBasicOnly: true,
    },
    {
      id: 'done',
      title: "You're all set!",
      body: "You've learned the basics of argumentation with collective attacks. Next, try the <strong>Evaluation Tutorial</strong> to see how collective attacks affect which arguments are accepted.",
      advanceOn: 'button',
      nextTutorialId: 'setaf-evaluation',
    },
  ],
}
