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

export const abaBasicsTutorial: Tutorial = {
  id: 'aba-basics',
  name: 'Basic ABA Tutorial',
  description: 'Learn how to build an ABA theory from atoms, rules and contraries.',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Assumption-based Argumentation!',
      body: [
        'An ',
        { text: 'ABA framework', tooltipId: 'ABAF' },
        ' is built from <strong>atoms</strong>. ',
        { text: 'Rules', tooltipId: 'abaRule' },
        ' derive new atoms, and some atoms are ',
        { text: 'assumptions', tooltipId: 'abaAssumption' },
        ' that hold by default. Each assumption has a ',
        { text: 'contrary', tooltipId: 'abaContrary' },
        ' — deriving it attacks the assumption. You can skip this tutorial at any time and restart it from the <strong>Tutorials</strong> menu.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'theory-panel',
      title: 'Two ways to edit',
      body: (isTouchDevice) =>
        `You can edit the theory <strong>graphically</strong> on the canvas or in the <strong>Theory panel</strong>${isTouchDevice ? ' (tap <strong>Theory</strong>)' : ''}, which lists atoms, assumptions and rules as text. Both stay in sync. This tutorial focuses on the canvas.<br><br>In the starter theory, <strong>a</strong> and <strong>b</strong> are assumptions, solid arrows are rules (e.g. <code>p ← a</code>), and dashed red lines mark contraries.`,
      highlight: 'theoryPanel',
      advanceOn: 'button',
    },
    {
      id: 'create-atom',
      title: 'Create an atom',
      body: (isTouchDevice) =>
        `${action(isTouchDevice ? 'Double-tap' : 'Double-click')} on an empty area of the canvas to create a new atom.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.nodeCount > baseline.nodeCount,
    },
    {
      id: 'make-assumption',
      title: 'Turn it into an assumption',
      body: (isTouchDevice) =>
        `${action(isTouchDevice ? 'Tap' : 'Click')} an atom to select it, then choose ${barAction(null, 'Make assumption')} in the action bar. A contrary <code>¬x</code> is created for it automatically.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.assumptionCount > baseline.assumptionCount,
    },
    {
      id: 'draw-rule',
      title: 'Draw a rule',
      body: (isTouchDevice) =>
        `${isTouchDevice ? `${action('Hold and drag')} from a body atom` : `${action('Right-click')} on a body atom, hold, and drag`} to the head to add a rule. The arrow means <em>derives</em>: dragging from <strong>a</strong> to <strong>p</strong> gives <code>p ← a</code>.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.ruleCount > baseline.ruleCount,
    },
    {
      id: 'collective-rule',
      title: 'Draw a rule with a larger body',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `A rule can need several atoms at once. ${action('Tap')} each body atom and choose ${barAction('add', 'Add to attack')} (or ${action('long-press')} it), then ${action('Hold and drag')} from one of them to the head.`
          : `A rule can need several atoms at once. ${action('Shift+Left-click')} the body atoms to select them, then ${action('Right-click')} on one of them, hold, and drag to the head.`,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.hyperLinkCount > baseline.hyperLinkCount,
    },
    {
      id: 'set-contrary',
      title: 'Change a contrary',
      body: (isTouchDevice) => [
        'Contraries are set in the Theory panel',
        isTouchDevice ? ' (tap <strong>Theory</strong>)' : '',
        '. Pick a different contrary for an assumption from the dropdown next to it. The ',
        { text: 'attack', tooltipId: 'abaAttack' },
        ' only takes effect once the contrary can be derived.',
      ],
      highlight: 'theoryPanel',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.contraryEditCount > baseline.contraryEditCount,
    },
    {
      id: 'delete',
      title: 'Delete an atom or rule',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} an atom or rule to select it, then tap ${barAction('delete', 'Delete')} in the action bar.`
          : `${action('Right-click and hold')} on an atom or rule to delete it.`,
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
      body: "You've learned how to build an ABA theory. Next, try the <strong>Views Tutorial</strong> to see the argumentation frameworks derived from it.",
      advanceOn: 'button',
      nextTutorialId: 'aba-views',
    },
  ],
}
