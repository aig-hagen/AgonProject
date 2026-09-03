import { expect, type Page,test } from '@playwright/test'

// Compact-shell editor chrome: open an example document, then exercise the bottom
// command bar + Menu sheet. Runs only on the Mobile Chrome / Mobile Safari projects.

async function openEditor(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'New', exact: true }).click()
  await page.getByRole('button', { name: 'Create new' }).first().click()
  await expect(page.getByRole('button', { name: 'Back to frameworks' })).toBeVisible()
  await expect(page).toHaveURL(/surface=editor/)
}

test('bottom command bar exposes the core editor actions', async ({ page }) => {
  await openEditor(page)
  for (const name of ['Fit to view', 'Relayout', 'Export', 'Undo']) {
    await expect(page.getByRole('button', { name })).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Evaluate' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible()
})

test('Menu sheet opens as a labelled dialog and closes', async ({ page }) => {
  await openEditor(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await menu.getByRole('button', { name: 'Close' }).click()
  await expect(menu).toBeHidden()
})

test('Relayout sheet opens and closes', async ({ page }) => {
  await openEditor(page)
  await page.getByRole('button', { name: 'Relayout' }).click()
  const sheet = page.getByRole('dialog', { name: 'Relayout' })
  await expect(sheet).toBeVisible()
  await sheet.getByRole('button', { name: 'Close' }).click()
  await expect(sheet).toBeHidden()
})

test('Export sheet opens and closes', async ({ page }) => {
  await openEditor(page)
  await page.getByRole('button', { name: 'Export' }).click()
  const sheet = page.getByRole('dialog', { name: 'Export' })
  await expect(sheet).toBeVisible()
  await sheet.getByRole('button', { name: 'Close' }).click()
  await expect(sheet).toBeHidden()
})

test('Evaluate sheet opens and closes', async ({ page }) => {
  await openEditor(page)
  await page.getByRole('button', { name: 'Evaluate' }).click()
  const sheet = page.getByRole('dialog', { name: 'Evaluate' })
  await expect(sheet).toBeVisible()
  await sheet.getByRole('button', { name: 'Close' }).first().click()
  await expect(sheet).toBeHidden()
})
