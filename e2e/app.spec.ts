import { expect,test } from '@playwright/test'

test('shows landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'AgonProject' })).toBeVisible()
})

test('glossary term links from tooltips open that term', async ({ page }) => {
  await page.goto('/glossary?term=CO')
  await expect(page).toHaveURL(/\/glossary\/AF\/CO$/)
  await expect(page.getByRole('heading', { name: 'Complete Semantics' })).toBeVisible()
})
