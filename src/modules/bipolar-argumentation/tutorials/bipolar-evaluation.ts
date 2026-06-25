/*
 * Argumentation Toolbox - A graphical application to create and inspect argumentation frameworks.
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

export const bipolarEvaluationTutorial: Tutorial = {
  id: 'bipolar-evaluation',
  name: 'Evaluation BAF Tutorial',
  description: 'Learn about different support interpretations and how to compute extension-based semantics for BAFs.',
  steps: [
    {
      id: 'intro',
      title: 'Evaluating the BAF',
      body: 'Extension-based semantics compute which sets of arguments are <em>acceptable</em> under a chosen semantics. In a BAF, <strong>support</strong> relations also influence the outcome - and how exactly depends on the chosen support interpretation.',
      advanceOn: 'button',
    },
    {
      id: 'open-eval',
      title: 'Open the evaluation panel',
      body: 'Click the <strong>Extension Semantics</strong> button (the variable icon) on the left to open an evaluation window.',
      anchor: 'evaluationButtons',
      placement: 'right-start',
      offsetPx: 64,
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
      advanceOn: 'button',
    },
    {
      id: 'pick-semantics',
      title: 'Pick a semantics and evaluate',
      body: [
        'Select a <strong>semantics</strong> (e.g. <em>Complete</em>) and a <strong>mode</strong> (e.g. ',
        { text: 'Credulous', tooltipId: 'credulousAcceptance' },
        ' or ',
        { text: 'Skeptical', tooltipId: 'skepticalAcceptance' },
        '), then press <strong>Evaluate</strong> to compute the result.',
      ],
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.evaluationCount > baseline.evaluationCount,
    },
    {
      id: 'compact-window',
      title: 'Window management',
      body:
        'Use the <span class="inline-flex items-center justify-center align-middle size-5 rounded bg-base-200 mx-0.5">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" class="size-4"><path d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" /></svg>' +
        '</span> <strong>Hide parameters</strong> button in the window header to collapse the controls and show only the results. You can also open <strong>multiple evaluation windows</strong> simultaneously — useful for comparing different support interpretations side by side.',
      advanceOn: 'button',
    },
    {
      id: 'read-results',
      title: 'Reading the results',
      body: 'Click one of the computed <strong>results</strong> to highlight it on the canvas. Arguments are coloured depending on their status:<ul class="list-disc list-inside mt-1 space-y-0.5"><li><span class="text-success font-medium">Green</span> — accepted</li><li><span class="text-info font-medium">Blue</span> — undecided</li><li><span class="text-error font-medium">Red</span> — rejected</li></ul>',
      advanceOn: 'action',
      advanceCondition: (ctx, baseline) => ctx.highlightCount > baseline.highlightCount,
    },
    {
      id: 'done',
      title: 'Great work!',
      body: 'You\'ve completed the Evaluation Tutorial. Explore more features like export and sharing from the menu.',
      advanceOn: 'button',
    },
  ],
}
