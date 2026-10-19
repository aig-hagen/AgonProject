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
export default {
  title: 'Glossary',
  backToEditor: 'Back to editor',
  searchPlaceholder: 'Search terms…',
  noResults: 'No results',
  selectTerm: 'Select a term from the list.',
  source: 'Reference',
  referencedBy: 'Referenced by',
  more: 'More',
  englishOnly: 'English only',
  less: 'Less',
  complexity: {
    title: 'Computational complexity',
    problem: 'Problem',
    general: 'General',
    bipolar: 'Bipolar',
    compareAll: 'Compare all semantics',
    semantics: 'Semantics',
    sources: 'Sources',
    trivial: 'trivial',
    complete: '-complete',
    completeShort: '-c',
    legend: 'X-c: X-complete. * qualified result (hover for details).',
    unlessPNP: 'unless P = NP',
    hard: '-hard',
    in: 'in',
  },
  principles: {
    title: 'Principles',
    compareAll: 'Compare all semantics',
    semantics: 'Semantics',
    principle: 'Principle',
    cardinality: 'Number of extensions',
    cardinalityValues: {
      zeroOrMore: 'zero or more',
      one: 'exactly one',
      oneOrMore: 'at least one',
    },
    satisfied: 'satisfied',
    violated: 'violated',
    open: 'open',
    unreferenced: 'trivial or by definition',
    satisfiedBy: 'Satisfied by',
    violatedBy: 'Violated by',
    openFor: 'Open for',
    show: 'Show',
    all: 'All',
    none: 'None',
    legend:
      '✓ satisfied · ✗ violated · ? open in the literature · empty: not examined. Hover a cell for its source.',
    groups: {
      conflictAndDefence: 'Conflict and defence',
      reinstatement: 'Reinstatement',
      extensionSets: 'Sets of extensions',
      independence: 'Independence and syntax',
      decomposition: 'Decomposition',
      reduct: 'Reduct and modularity',
      adequacy: 'Skepticism and resolution adequacy',
    },
  },
}
