import { expect, test } from '@playwright/test'

// Compact-shell acceptance. These specs run only on the Mobile Chrome / Mobile Safari
// projects (viewport < 768px), where useLayoutMode selects the compact shell.

test('compact viewport renders the mobile home shell, not the desktop landing', async ({
  page,
}) => {
  await page.goto('/')
  // Mobile hero + Frameworks/New segmented control instead of the desktop landing hero.
  await expect(page.getByRole('heading', { name: 'AgonProject' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Frameworks', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New', exact: true })).toBeVisible()
  // The desktop landing heading must not be present in the compact shell.
  await expect(
    page.getByRole('heading', { name: 'Create and Inspect Argumentation Frameworks' }),
  ).toHaveCount(0)
})

test('create a document from New and land on the editor surface', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'New', exact: true }).click()
  // The first editable formalism card is auto-expanded, so "Create new" is visible.
  await page.getByRole('button', { name: 'Create new' }).first().click()

  // Editor surface: the switcher chip doubles as the home button.
  await expect(page.getByRole('button', { name: 'Back to frameworks' })).toBeVisible()
  await expect(page).toHaveURL(/surface=editor/)
})

test('switcher chip opens Documents and Back returns to the editor', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'New', exact: true }).click()
  await page.getByRole('button', { name: 'Create new' }).first().click()
  await expect(page).toHaveURL(/surface=editor/)

  // Tapping the switcher chip pushes the Documents surface.
  await page.getByRole('button', { name: 'Back to frameworks' }).click()
  await expect(page).toHaveURL(/surface=documents/)

  // Browser Back returns to the editor, which stayed mounted underneath.
  await page.goBack()
  await expect(page).toHaveURL(/surface=editor/)
  await expect(page.getByRole('button', { name: 'Back to frameworks' })).toBeVisible()
})
