import { expect, type Page,test } from '@playwright/test'

// Accessibility contract for the compact shell: BottomSheet focus behaviour,
// minimum touch-target sizes, and no horizontal overflow. Mobile projects only.

const MIN_TOUCH_TARGET = 44

async function openEditor(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'New', exact: true }).click()
  await page.getByRole('button', { name: 'Create new' }).first().click()
  await expect(page.getByRole('button', { name: 'Back to documents' })).toBeVisible()
}

test('opening a sheet moves focus into it; Escape closes and restores focus', async ({ page }) => {
  await openEditor(page)

  const trigger = page.getByRole('button', { name: 'Menu' })
  await trigger.click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()

  // Focus must land inside the sheet (focus trap entry).
  const focusInSheet = await menu.evaluate((el) => el.contains(document.activeElement))
  expect(focusInSheet).toBe(true)

  // Escape dismisses and returns focus to the button that opened it.
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('sheet dialogs expose an accessible name', async ({ page }) => {
  await openEditor(page)
  await page.getByRole('button', { name: 'Relayout' }).click()
  // Querying the dialog by name only resolves if the accessible name is present.
  await expect(page.getByRole('dialog', { name: 'Relayout' })).toBeVisible()
})

test('notifications render inside a live region', async ({ page }) => {
  await openEditor(page)
  // The toast container is a polite live region so screen readers announce toasts.
  const live = page.locator('[role="status"][aria-live="polite"]')
  await expect(live).toHaveCount(1)
})

test('editor chrome touch targets meet the minimum size', async ({ page }) => {
  await openEditor(page)
  const labels = ['Back to documents', 'Menu', 'Fit to view', 'Relayout', 'Export', 'Evaluate']
  for (const name of labels) {
    const box = await page.getByRole('button', { name }).boundingBox()
    expect(box, `${name} should be measurable`).not.toBeNull()
    expect(box!.height, `${name} height`).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
    expect(box!.width, `${name} width`).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
  }
})

test('sheet close button meets the minimum touch-target size', async ({ page }) => {
  await openEditor(page)
  await page.getByRole('button', { name: 'Menu' }).click()
  const close = page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Close' })
  const box = await close.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
  expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET)
})

test('no horizontal overflow in the editor or an open sheet', async ({ page }) => {
  await openEditor(page)
  const overflow = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
  expect(await overflow(), 'editor').toBe(false)
  await page.getByRole('button', { name: 'Evaluate' }).click()
  await expect(page.getByRole('dialog', { name: 'Evaluate' })).toBeVisible()
  expect(await overflow(), 'evaluate sheet open').toBe(false)
})
