import { expect, test } from '@playwright/test'

// Resizing across the 768px compact breakpoint swaps the presentation shell
// (useLayoutMode is viewport-driven). The open document must survive the swap in
// both directions — a shared-controller requirement from the mobile layout plan.
// Runs on the desktop projects (the mobile projects lock their device viewport).

const MOBILE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 800 }

test('open document survives resizing across the compact breakpoint', async ({ page }) => {
  // Start in the compact shell and create a document.
  await page.setViewportSize(MOBILE)
  await page.goto('/')
  await page.getByRole('button', { name: 'New', exact: true }).click()
  await page.getByRole('button', { name: 'Create new' }).first().click()
  await expect(page.getByRole('button', { name: 'Back to documents' })).toBeVisible()

  // Grow to the desktop shell: the same document is now an editor tab.
  await page.setViewportSize(DESKTOP)
  await expect(page.getByRole('tab').getByRole('textbox')).toBeVisible()
  // The compact chrome is gone (no duplicate mounted shell).
  await expect(page.getByRole('button', { name: 'Back to documents' })).toHaveCount(0)

  // Shrink back to compact: still the editor surface, document intact.
  await page.setViewportSize(MOBILE)
  await expect(page.getByRole('button', { name: 'Back to documents' })).toBeVisible()
  await expect(page).toHaveURL(/surface=editor/)
})
