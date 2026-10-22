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

export const abaViewsTutorial: Tutorial = {
  id: 'aba-views',
  name: 'ABA Views Tutorial',
  description: 'Learn how to view your ABA theory as an AF or SetAF.',
  steps: [
    {
      id: 'intro',
      title: 'Views on ABA theories',
      body: [
        'An ABA theory can be instantiated via other argumentation formalisms. These views are <strong>read-only</strong>. In general, the ',
        { text: 'attacks', tooltipId: 'abaAttack' },
        ' are derived via rules that derive the contrary of an assumption.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'af-view',
      title: 'The AF view',
      body: [
        'Switch to the <strong>AF</strong> view. Each node is an argument: a claim derived from a set of assumptions. An argument attacks another when its claim is the contrary of an assumption the other one relies on. This view needs a ',
        { text: 'flat', tooltipId: 'abaFlat' },
        ' theory — if it is locked, remove rules that derive an assumption.',
      ],
      highlight: 'viewSwitcher',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.activeView === 'af',
    },
    {
      id: 'setaf-view',
      title: 'The SetAF view',
      body: "Now switch to the <strong>SetAF</strong> view. Here the nodes are just the assumptions, and each attack comes from a set of assumptions that together derive the target's contrary. For non-flat theories this slot shows a <strong>BSAF</strong>, which adds set-supports.",
      highlight: 'viewSwitcher',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.activeView === 'setaf',
    },
    {
      id: 'edit-in-views',
      title: 'Keep editing in the panel',
      body: (isTouchDevice) =>
        `The canvas is read-only here, but the <strong>Theory panel</strong>${isTouchDevice ? ' (tap <strong>Theory</strong>)' : ''} still works in every view. Add a rule or an assumption there and watch this view update right away.`,
      highlight: 'theoryPanel',
      advanceOn: 'button',
      advanceCondition: (ctx, base) =>
        ctx.ruleCount !== base.ruleCount ||
        ctx.assumptionCount !== base.assumptionCount ||
        ctx.contraryEditCount !== base.contraryEditCount,
    },
    {
      id: 'done',
      title: 'Great work!',
      body: 'You now know how your theory maps to AFs and SetAFs. Edit in the panel from any view to see right away how a change affects the attacks, or switch back to the <strong>Theory</strong> view to edit on the canvas. Each view remembers its own layout.',
      highlight: 'viewSwitcher',
      advanceOn: 'button',
    },
  ],
}
