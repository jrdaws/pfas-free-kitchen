import { test, expect } from '@playwright/test';

test('homepage visual snapshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  expect(await page.screenshot()).toMatchSnapshot('home.png');
});
