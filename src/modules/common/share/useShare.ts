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

export async function uploadShare(content: string): Promise<{ id: string; url: string }> {
  const response = await fetch('/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Upload failed (${response.status})`)
  }
  const { id } = (await response.json()) as { id: string }
  return { id, url: `${window.location.origin}/share/${id}` }
}

export async function fetchShare(id: string): Promise<string> {
  const response = await fetch(`/shares/${encodeURIComponent(id)}`)
  if (!response.ok) {
    if (response.status === 404) throw new Error('Share link not found or expired')
    throw new Error(`Failed to load share (${response.status})`)
  }
  const body = (await response.json()) as { content: string }
  return body.content
}
