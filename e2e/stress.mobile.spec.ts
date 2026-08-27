import { expect, test } from '@playwright/test'

// Many-documents smoke for the compact shell: creating a batch of documents keeps
// the list correct and the app responsive, with no uncaught console errors (a proxy
// for duplicated watchers / leaks). Part of the Phase 7 performance/memory checks.

const COUNT = 8

test('creates and lists many documents without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')

  async function createOne() {
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByRole('button', { name: 'Create new' }).first().click()
    await expect(page.getByRole('button', { name: 'Back to documents' })).toBeVisible()
  }

  await createOne()
  for (let i = 1; i < COUNT; i++) {
    await page.getByRole('button', { name: 'Back to documents' }).click()
    await createOne()
  }

  // The Documents list holds every created document.
  await page.getByRole('button', { name: 'Back to documents' }).click()
  await expect(page.getByRole('button', { name: /^Actions for/ })).toHaveCount(COUNT)

  // Reopening one still lands in a working editor.
  await page.getByRole('main').locator('li button').first().click()
  await expect(page).toHaveURL(/surface=editor/)
  await expect(page.getByRole('button', { name: 'Evaluate' })).toBeVisible()

  expect(errors, errors.join('\n')).toEqual([])
})
