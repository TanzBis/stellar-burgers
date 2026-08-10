import { test, expect } from '@playwright/test';

test.describe('Конструктор бургеров', () => {
  test.beforeEach(async ({ page, context }) => {
    // 1. Ингредиенты берем из HAR-файла
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    // 2. Жестко возвращаем успешный профиль пользователя,
    // чтобы приложение со старта знало, что мы авторизованы
    await page.route('**/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@test.ru',
            name: 'Tanzila'
          }
        })
      });
    });

    // 3. Жестко возвращаем ваш номер заказа 109008
    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          name: 'Краторный био-бургер',
          order: {
            number: 109008
          }
        })
      });
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

    await expect(page.getByText(ingredientNameText).first()).toBeVisible();

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

  test('Создание заказа', async ({ page, context }) => {
    // Внедряем токены в localStorage ПЕРЕД переходом на сайт.
    // Этот скрипт сработает железно в момент инициализации страницы.
    await context.addInitScript(() => {
      window.localStorage.setItem('accessToken', 'Bearer mock_access_token');
      window.localStorage.setItem('refreshToken', 'mock_refresh_token');
    });

    // Добавляем куки
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer mock_access_token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Теперь спокойно переходим на главную
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

    // 1. Проверяем появление номера заказа на экране
    const orderModalText = page.getByText('109008');
    await expect(orderModalText).toBeVisible({ timeout: 10000 });

    // 2. Проверяем, что конструктор бургера полностью очистился после успешного заказа
    await expect(
      page.locator('section').filter({ hasText: 'Выберите булки' })
    ).toBeVisible();

    // 3. Находим кнопку закрытия (крестик) внутри модалки портала и кликаем
    const closeButton = page
      .locator('#modals button, [class*="close"]')
      .first();
    await closeButton.click();
    await expect(orderModalText).not.toBeVisible();
  });
});
