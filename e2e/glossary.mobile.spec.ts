import { expect, test } from '@playwright/test'

// Compact glossary: index → module list → entry, with back returning to the previous page.

test('drill down from the index to an entry and back', async ({ page }) => {
  await page.goto('/')
  await page.goto('/glossary')
  await page.getByRole('link', { name: /Abstract Argumentation/ }).click()
  await expect(page).toHaveURL(/\/glossary\/AF$/)

  await page.getByRole('link', { name: 'Stable Semantics', exact: true }).click()
  await expect(page).toHaveURL(/\/glossary\/AF\/ST$/)
  await expect(page.getByRole('heading', { level: 2, name: /Stable Semantics/ })).toBeVisible()

  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/glossary\/AF$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/glossary$/)
})

test('a deep link goes up to the module list instead of leaving the site', async ({ page }) => {
  await page.goto('/glossary/AF/ST')
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/glossary\/AF$/)
})

test('Principles opens on its overview, followed by its entries', async ({ page }) => {
  await page.goto('/glossary/Principles')
  await expect(page).toHaveURL(/\/glossary\/Principles\/principlesAF$/)
  await expect(page.getByRole('table')).toBeVisible()
  // Header row and first column stay put while the table scrolls.
  await expect(page.locator('thead th.table-sticky-col')).toHaveCSS('position', 'sticky')
  await expect(page.getByText('All entries')).toBeVisible()

  // Column headers open their semantics' page; back returns to the table.
  await page.getByRole('link', { name: 'CO', exact: true }).click()
  await expect(page).toHaveURL(/\/glossary\/AF\/CO$/)
  await page.getByRole('button', { name: 'Back' }).click()
  await expect(page).toHaveURL(/\/glossary\/Principles\/principlesAF$/)
})

test('the index searches all modules', async ({ page }) => {
  await page.goto('/glossary')
  await page.getByRole('searchbox').fill('weak admissibility')
  await page.locator('a[href="/glossary/SetAF/setafWAD"]').click()
  await expect(page).toHaveURL(/\/glossary\/SetAF\/setafWAD$/)
})
