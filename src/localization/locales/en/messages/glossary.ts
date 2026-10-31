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
  back: 'Back',
  searchPlaceholder: 'Search entries…',
  searchAll: 'Search the glossary…',
  searchModule: 'Search {name}…',
  results: '{n} result | {n} results',
  allEntries: 'All entries',
  // Section labels of the mobile glossary index.
  index: {
    frameworks: 'Approaches',
    topics: 'Topics',
    references: 'References',
  },
  noResults: 'No results',
  selectTerm: 'Select an entry from the list.',
  source: 'Reference',
  referencedBy: 'Referenced by',
  more: 'More',
  sources: 'Sources',
  // Names of the glossary tabs that aren't app modules.
  modules: {
    complexity: 'Computational Complexity',
    principles: 'Argumentation Principles',
  },
  complexity: {
    groups: {
      overviews: 'Overviews',
      problems: 'Reasoning Problems',
      classes: 'Complexity Classes',
      other: 'Other',
    },
    title: 'Computational complexity',
    problem: 'Problem',
    general: 'General',
    bipolar: 'Bipolar',
    generalHeading: 'General ADFs',
    bipolarHeading: 'Bipolar ADFs',
    bipolarNote:
      'Results for {term}, assuming the link types are known, i.e. given as part of the input.',
    bipolarTerm: 'bipolar ADFs',
    compareAll: 'Compare all semantics',
    semantics: 'Semantics',
    trivial: 'trivial',
    complete: '-complete',
    completeShort: '-c',
    unlessPNP: 'unless P = NP',
    hard: '-hard',
    in: 'in',
  },
  principles: {
    title: 'Principles',
    compareAll: 'Compare all semantics',
    semantics: 'Semantics',
    principle: 'Principle',
    show: 'Show',
    all: 'All',
    none: 'None',
    legend: '✓ satisfied · ✗ violated · ? open',
    groups: {
      conflictAndDefence: 'Conflict and Defence',
      basic: 'Basic',
      structureOfExtensions: 'Structure of Extensions',
      directionality: 'Directionality',
      invariance: 'Invariance',
      modularity: 'Modularity',
      decomposition: 'Decomposition',
      weakAdmissibility: 'Weak Admissibility',
    },
  },
}
