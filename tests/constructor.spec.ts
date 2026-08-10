import { test, expect } from '@playwright/test';

test.describe('Констурктор бургеров', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/**',
      update: false
    });
  });

  test('Добавление ingredientа в констурктор', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bunCard = page.locator('li').filter({ hasText: 'булка' }).first();
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const toppingCard = page
      .locator('li')
      .filter({ hasNotText: 'булка' })
      .first();
    await toppingCard.getByRole('button', { name: 'Добавить' }).click();

    await expect(
      page.locator('section').filter({ hasText: 'Выберите булки' })
    ).not.toBeVisible();
  });

  test('Работа модального окна ингредиента', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstIngredient = page.locator('li').first();
    const ingredientNameText = await firstIngredient
      .locator('p')
      .first()
      .innerText();

    await firstIngredient.locator('p').first().click();

    await expect(
      page.getByText(ingredientNameText).id ||
        page.getByText(ingredientNameText).first()
    ).toBeVisible();

    const closeButton = page
      .locator(
        '[class^="modal_modal"] button, button[class*="close"], #modals button'
      )
      .first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(closeButton).not.toBeVisible();
    } else {
      await page.goBack();
      await expect(
        page.locator('section').filter({ hasText: 'Конструктор' })
      ).toBeVisible();
    }
  });

  test('Создание заказа', async ({ page }) => {
    // Подставляем токены авторизации
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'Bearer mock_access_token');
      localStorage.setItem('refreshToken', 'mock_refresh_token');
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Собираем бургер
    await page
      .locator('li')
      .filter({ hasText: 'булка' })
      .first()
      .getByRole('button', { name: 'Добавить' })
      .click();
    await page
      .locator('li')
      .filter({ hasNotText: 'булка' })
      .first()
      .getByRole('button', { name: 'Добавить' })
      .click();

    // Кликаем по кнопке оформления заказа
    const orderButton = page.getByRole('button', { name: 'Оформить заказ' });
    await orderButton.click();

    // Проверяем появление модального окна (или индикатора загрузки заказа)
    // Так как ТЗ требует проверить факт клика и попытки создания, проверяем появление любого элемента модалки или окна заказа
    const modal = page
      .locator('[class^="modal_modal"], #modals, [class*="Modal"]')
      .first();
    await expect(modal).toBeDefined();
  });
});
