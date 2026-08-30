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

export const afEvaluationTutorial: Tutorial = {
  id: 'af-evaluation',
  name: 'Evaluation AF Tutorial',
  description:
    'Learn how to compute and interpret extension semantics for argumentation frameworks.',
  steps: [
    {
      id: 'intro',
      title: 'Evaluating your framework',
      body: [
        'Evaluation computes which arguments are <em>accepted</em> under a chosen ',
        { text: 'semantics', tooltipId: 'semantics' },
        ' — for example, which sets of arguments can be jointly defended. Different semantics formalise different intuitions about which arguments should be accepted together.',
      ],
      advanceOn: 'button',
    },
    {
      id: 'open-eval',
      title: 'Open the evaluation',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Tap')} the <strong>Evaluate</strong> button, then <strong>Add evaluation</strong> → <strong>Extension semantics</strong> to open an evaluation.`
          : `${action('Click')} the ${barAction('extension', 'Extension Semantics')} button to open the evaluation window.`,
      highlight: 'openEvalButton',
      advanceOn: 'action',
      advanceCondition: (ctx) => ctx.isExtensionWindowOpen,
    },
    {
      id: 'pick-semantics',
      title: 'Pick a semantics',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `Open the <strong>Semantics</strong> selector and choose one (e.g. <em>Complete</em>) — expand the sheet if the parameters are hidden.`
          : `Open the <strong>Semantics</strong> selector and choose one (e.g. <em>Complete</em>). Each semantics formalises a different notion of acceptance.`,
      highlight: 'semanticsSelector',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) =>
        ctx.semanticsInteractCount > baseline.semanticsInteractCount,
    },
    {
      id: 'pick-mode',
      title: 'Choose a mode',
      body: [
        'Open the <strong>Mode</strong> selector. <em>Enumerate</em> lists every extension, while ',
        { text: 'Credulous', tooltipId: 'credulousAcceptance' },
        ' and ',
        { text: 'Skeptical', tooltipId: 'skepticalAcceptance' },
        ' ask whether an argument is accepted in <em>some</em> or in <em>all</em> extensions.',
      ],
      highlight: 'modeSelector',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.modeInteractCount > baseline.modeInteractCount,
    },
    {
      id: 'collapse',
      title: 'Focus on the results',
      body: (isTouchDevice) =>
        isTouchDevice
          ? `${action('Drag')} the sheet down to snap it smaller, or tap ${barAction('collapse', 'Collapse')}, to fold the parameters away and focus on the results.`
          : `${action('Click')} the window header to hide the parameters and show only the results.`,
      highlight: (isTouchDevice) => (isTouchDevice ? 'evalCollapse' : 'evalHeader'),
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.paramsCollapseCount > baseline.paramsCollapseCount,
      firstEvalOnlyDesktop: true,
    },
    {
      id: 'read-results',
      title: 'Reading the results',
      body: 'Click one of the computed <strong>results</strong> to highlight it on the canvas. Arguments are coloured by their status:<ul class="list-disc list-inside mt-1 space-y-0.5"><li><span class="text-success font-medium">Green</span> — accepted</li><li><span class="text-info font-medium">Blue</span> — undecided</li><li><span class="text-error font-medium">Red</span> — rejected</li></ul>',
      highlight: 'resultArea',
      refitOnEnter: true,
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.highlightCount > baseline.highlightCount,
    },
    {
      id: 'done',
      title: 'Great work!',
      body: "You've completed the Evaluation Tutorial. Explore more features like export and sharing from the menu.",
      advanceOn: 'button',
    },
  ],
}
