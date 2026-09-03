import { expect, type Page,test } from '@playwright/test'

// One create-from-example -> Evaluate -> Export flow per module, exercising each
// module's evaluation host + export wiring in the compact shell. SETAF is omitted
// (deferred with the gesture spike). Evaluation results are backend-dependent
// (TweetyProject), so these assert the sheets open, not computed results.

const MODULES = [
  'Abstract Argumentation',
  'Bipolar Argumentation',
  'Incomplete Argumentation',
  'Dialectical Argumentation',
  'Probabilistic Argumentation',
]

async function openExample(page: Page, moduleName: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'New', exact: true }).click()
  // Expand the module's card if it isn't the auto-expanded one, then open its
  // first bundled example so the editor has content.
  const header = page.getByRole('button', { name: moduleName }).first()
  if ((await header.getAttribute('aria-expanded')) !== 'true') {
    await header.click()
  }
  await page.getByRole('main').locator('button.rounded-full').first().click()
  await expect(page.getByRole('button', { name: 'Back to frameworks' })).toBeVisible()
}

for (const moduleName of MODULES) {
  test(`${moduleName}: example -> evaluate -> export`, async ({ page }) => {
    await openExample(page, moduleName)

    // Evaluate sheet opens for this module's kinds, then closes.
    await page.getByRole('button', { name: 'Evaluate' }).click()
    const evaluate = page.getByRole('dialog', { name: 'Evaluate' })
    await expect(evaluate).toBeVisible()
    await evaluate.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(evaluate).toBeHidden()

    // Export sheet opens with this module's format list, then closes.
    await page.getByRole('button', { name: 'Export' }).click()
    const exportSheet = page.getByRole('dialog', { name: 'Export' })
    await expect(exportSheet).toBeVisible()
    await exportSheet.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(exportSheet).toBeHidden()
  })
}
