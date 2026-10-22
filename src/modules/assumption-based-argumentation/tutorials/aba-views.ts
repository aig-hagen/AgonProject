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
      title: 'Views of your theory',
      body: [
        'Your theory can be shown as other argumentation frameworks, built from its rules and contraries. These views are <strong>read-only</strong> — you edit only in the Theory view, and every view follows your changes. A set of assumptions ',
        { text: 'attacks', tooltipId: 'abaAttack' },
        ' an assumption when it derives that assumption’s contrary.',
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
      body: 'Now switch to the <strong>SetAF</strong> view. Here the nodes are just the assumptions, and each attack comes from a set of assumptions that together derive the target’s contrary. For non-flat theories this slot shows a <strong>BSAF</strong>, which adds set-supports.',
      highlight: 'viewSwitcher',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.activeView === 'setaf',
    },
    {
      id: 'back-to-theory',
      title: 'Back to the theory',
      body: 'Switch back to the <strong>Theory</strong> view to keep editing. Each view remembers its own layout.',
      highlight: 'viewSwitcher',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.activeView === 'theory',
    },
    {
      id: 'done',
      title: 'Great work!',
      body: 'You now know how your theory maps to AFs and SetAFs. Switch views any time to see how an edit changes the attacks.',
      advanceOn: 'button',
    },
  ],
}
