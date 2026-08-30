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

export const bipolarEvaluationTutorial: Tutorial = {
  id: 'bipolar-evaluation',
  name: 'Evaluation BAF Tutorial',
  description:
    'Learn about different support interpretations and how to compute extension-based semantics for BAFs.',
  steps: [
    {
      id: 'intro',
      title: 'Evaluating the BAF',
      body: 'Extension-based semantics compute which sets of arguments are <em>acceptable</em> under a chosen semantics. In a BAF, <strong>support</strong> relations also influence the outcome - and how exactly depends on the chosen support interpretation.',
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
      id: 'support-interpretation',
      title: 'Choose a support interpretation',
      body: [
        'The <strong>Support</strong> selector determines how support relations are reduced to attacks - for example ',
        { text: 'deductive', tooltipId: 'deductiveSupport' },
        ' or ',
        { text: 'necessary', tooltipId: 'necessarySupport' },
        '. Different interpretations can lead to different results for the same framework.',
      ],
      highlight: 'supportSelector',
      advanceOn: 'button',
    },
    {
      id: 'pick-semantics',
      title: 'Pick a semantics',
      body: [
        'Select a <strong>semantics</strong> (e.g. <em>Complete</em>) and a <strong>mode</strong> (e.g. ',
        { text: 'Credulous', tooltipId: 'credulousAcceptance' },
        ' or ',
        { text: 'Skeptical', tooltipId: 'skepticalAcceptance' },
        ').',
      ],
      highlight: 'semanticsSelector',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.evaluationCount > baseline.evaluationCount,
    },
    {
      id: 'compact-window',
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
      body: 'Click one of the computed <strong>results</strong> to highlight it on the canvas. Arguments are coloured depending on their status:<ul class="list-disc list-inside mt-1 space-y-0.5"><li><span class="text-success font-medium">Green</span> — accepted</li><li><span class="text-info font-medium">Blue</span> — undecided</li><li><span class="text-error font-medium">Red</span> — rejected</li></ul>',
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
