import { expect, test } from '@playwright/test'

test('rename tab syncs across open pages', async ({ context }) => {
  const page1 = await context.newPage()
  const page2 = await context.newPage()
  await page1.goto('/')
  await page2.goto('/')

  // Create a document from the desktop landing (first module card).
  await page1.getByRole('button', { name: 'Create new' }).first().click()

  const tab1 = page1.getByRole('tab').getByRole('textbox')
  const tab2 = page2.getByRole('tab').getByRole('textbox')
  await expect(tab1).toBeVisible()
  await expect(tab2).toBeVisible()

  await tab1.fill('argumentation1')
  await expect(tab1).toHaveValue('argumentation1')
  await expect(tab2).toHaveValue('argumentation1')
})
