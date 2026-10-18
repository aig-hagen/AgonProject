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
/** Formalism tags, one per module. Acronyms, so they need no translation. */
export const FORMALISM_TAGS = ['AF', 'ADF', 'BAF', 'SetAF', 'PAF', 'iAF', 'ABA'] as const

/** Topic tags. Labels live in the `literature.tags.<id>` message catalog. */
export const TOPIC_TAGS = [
  'semantics',
  'ranking',
  'complexity',
  'algorithms',
  'principles',
  'survey',
  'handbook',
  'foundations',
] as const

export type FormalismTag = (typeof FORMALISM_TAGS)[number]
export type TopicTag = (typeof TOPIC_TAGS)[number]
export type PublicationTag = FormalismTag | TopicTag
