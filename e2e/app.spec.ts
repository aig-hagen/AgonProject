import { expect,test } from '@playwright/test'

test('shows landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Create and Inspect Argumentation Frameworks' })).toBeVisible()
})
