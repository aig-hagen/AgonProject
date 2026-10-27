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
  title: 'Glossar',
  backToEditor: 'Zurück zum Editor',
  searchPlaceholder: 'Begriffe suchen…',
  noResults: 'Keine Ergebnisse',
  selectTerm: 'Wähle einen Begriff aus der Liste.',
  source: 'Referenz',
  referencedBy: 'Verwendet in',
  more: 'Mehr',
  less: 'Weniger',
  sources: 'Quellen',
  complexity: {
    groups: {
      overviews: 'Übersichten',
      problems: 'Entscheidungsprobleme',
      classes: 'Komplexitätsklassen',
      other: 'Weitere',
    },
    title: 'Berechnungskomplexität',
    problem: 'Problem',
    general: 'Allgemein',
    bipolar: 'Bipolar',
    generalHeading: 'Allgemeine ADFs',
    bipolarHeading: 'Bipolare ADFs',
    bipolarNote:
      'Ergebnisse für {term}, unter der Annahme, dass die Kantentypen bekannt sind, also zur Eingabe gehören.',
    bipolarTerm: 'bipolare ADFs',
    compareAll: 'Alle Semantiken vergleichen',
    semantics: 'Semantik',
    trivial: 'trivial',
    complete: '-vollständig',
    completeShort: '-v',
    unlessPNP: 'außer P = NP',
    hard: '-schwer',
    in: 'in',
  },
  principles: {
    title: 'Postulate',
    compareAll: 'Alle Semantiken vergleichen',
    semantics: 'Semantik',
    principle: 'Postulat',
    show: 'Anzeigen',
    all: 'Alle',
    none: 'Keine',
    legend: '✓ erfüllt · ✗ verletzt · ? offen',
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
