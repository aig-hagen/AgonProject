import { test, expect } from '@playwright/test'

test('rename tab', async ({ context }) => {
  const page1 = await context.newPage()
  const page2 = await context.newPage()
  await page1.goto('/')
  await page2.goto('/')

  await page1.getByRole('button', { name: 'Create' }).click()
  await expect(page1.getByRole('tab').getByPlaceholder('new argumentation')).toBeVisible()
  await expect(page2.getByRole('tab').getByPlaceholder('new argumentation')).toBeVisible()

  await page1.getByRole('tab').getByPlaceholder('new argumentation').fill("argumentation1")
  await expect(page1.getByRole('tab', { name: 'argumentation1' })).toBeVisible()
  await expect(page2.getByRole('tab', { name: 'argumentation1' })).toBeVisible()
})
