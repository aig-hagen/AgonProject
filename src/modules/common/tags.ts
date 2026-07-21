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

export interface Tag {
  name: string
  description: string
}

export const TAG_ABSTRACT: Tag = {
  name: 'Abstract',
  description: 'Arguments are abstract entities without internal structure.',
}

export const TAG_AUGMENTED: Tag = {
  name: 'Augmented',
  description: 'Arguments are augmented with additional information, such as a claim or premises.',
}

export const TAG_UNCERTAINTY: Tag = {
  name: 'Uncertainty',
  description: 'The framework represents incomplete information or probabilities.',
}

export const TAG_ATTACK: Tag = {
  name: 'Attack',
  description: 'The framework models attack relations between arguments.',
}

export const TAG_SUPPORT: Tag = {
  name: 'Support',
  description: 'The framework models support relations between arguments.',
}

export const TAG_COLLECTIVE_RELATIONS: Tag = {
  name: 'Collective Relations',
  description: 'Relations can involve sets of arguments rather than single arguments.',
}

export const TAG_CONSTRAINTS: Tag = {
  name: 'Constraints',
  description: 'The framework allows for additional constraints on the acceptance of arguments.',
}

export const TAG_WEIGHTS: Tag = {
  name: 'Weights',
  description: 'Arguments or relations can be assigned weights, probabilities, or values.',
}

export const allTags: Tag[] = [
  TAG_ABSTRACT,
  TAG_AUGMENTED,
  TAG_UNCERTAINTY,
  TAG_ATTACK,
  TAG_SUPPORT,
  TAG_COLLECTIVE_RELATIONS,
  TAG_CONSTRAINTS,
  TAG_WEIGHTS,
]
