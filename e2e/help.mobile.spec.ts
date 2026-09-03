import { expect, type Page,test } from '@playwright/test'

// The Help ("How to edit") sheet must describe each module's real primary node-tap
// action, not claim tap always renames (mobile layout plan, Help section).

async function openExample(page: Page, moduleName: string) {
  await page.goto('/')
  await page.getByRole('button', { name: 'New', exact: true }).click()
  const header = page.getByRole('button', { name: moduleName }).first()
  if ((await header.getAttribute('aria-expanded')) !== 'true') {
    await header.click()
  }
  await page.getByRole('main').locator('button.rounded-full').first().click()
  await expect(page.getByRole('button', { name: 'Back to frameworks' })).toBeVisible()
}

async function openHelp(page: Page) {
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Help' }).click()
  const help = page.getByRole('dialog', { name: 'How to edit' })
  await expect(help).toBeVisible()
  return help
}

test('AF Help describes tap as rename', async ({ page }) => {
  await openExample(page, 'Abstract Argumentation')
  const help = await openHelp(page)
  await expect(help.getByText('Rename it')).toBeVisible()
})

test('ADF Help describes tap as opening the acceptance condition', async ({ page }) => {
  await openExample(page, 'Dialectical Argumentation')
  const help = await openHelp(page)
  await expect(help.getByText('Open its acceptance condition')).toBeVisible()
  await expect(help.getByText('Rename it')).toHaveCount(0)
})

test('PAF Help describes tap as opening the probability', async ({ page }) => {
  await openExample(page, 'Probabilistic Argumentation')
  const help = await openHelp(page)
  await expect(help.getByText('Open its probability')).toBeVisible()
  await expect(help.getByText('Rename it')).toHaveCount(0)
})
