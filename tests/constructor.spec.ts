import { test, expect } from '@playwright/test';

const HAR_PATH = 'tests/hars/app.har';
const API_URL = 'https://norma.education-services.ru/api';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(HAR_PATH, {
      url: `${API_URL}/**`,
      notFound: 'abort'
    });
  });

  test('главная страница открывается', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'Соберите бургер'
      })
    ).toBeVisible();
  });

  test('можно добавить булку и начинку в конструктор', async ({ page }) => {
    await page.goto('/');

    const constructor = page.getByTestId('burger-constructor');

    // Кликаем по Краторной булке
    const bunCard = page.getByTestId('ingredient-643d69a5c3f7b9001cfa093c');
    await bunCard.locator('button', { hasText: 'Добавить' }).click();

    // Кликаем по твоей Биокотлете из марсианской Магнолии
    const sauceCard = page.getByTestId('ingredient-643d69a5c3f7b9001cfa0941');
    await sauceCard.locator('button', { hasText: 'Добавить' }).click();

    // Проверяем элементы в конструкторе (Булки и твою Биокотлету)
    await expect(constructor.getByText(/Краторная булка.*верх/i)).toBeVisible();
    await expect(constructor.getByText(/Краторная булка.*низ/i)).toBeVisible();
    await expect(
      constructor.getByText(/Биокотлета из марсианской Магнолии/i)
    ).toBeVisible();
  });

  test('открывается и закрывается модальное окно ингредиента по крестику', async ({
    page
  }) => {
    await page.goto('/');

    const bunCard = page.getByTestId('ingredient-643d69a5c3f7b9001cfa093c');

    await bunCard.getByRole('link').click();

    const modal = page.locator('#modals');

    await expect(
      modal.getByRole('heading', {
        name: 'Детали ингредиента'
      })
    ).toBeVisible();

    await expect(
      modal.getByRole('heading', {
        name: 'Краторная булка N-200i'
      })
    ).toBeVisible();

    await page.locator('#modals button').click();

    await expect(
      modal.getByRole('heading', {
        name: 'Детали ингредиента'
      })
    ).toHaveCount(0);
  });

  test('можно оформить заказ', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'accessToken',
        value:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhN2NhMzRiNmExNzJkMDAxYjk5MjRlNCIsImlhdCI6MTc4NjYzNTA2MSwiZXhwIjoxNzg2NjM2MjYxfQ.uOJI0qRUVHGiiOrvl3bRvyoQlWX_NiiIBnQbvB96za0',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.addInitScript(() => {
      localStorage.setItem(
        'refreshToken',
        '6909fd1ea05d625c9523fe743337f52bf45dbae76ad20feb195bd33abeacdc1f2d82c045b9ab2d91'
      );
    });

    await page.goto('/');

    await page.evaluate(() => {
      localStorage.setItem(
        'refreshToken',
        '6909fd1ea05d625c9523fe743337f52bf45dbae76ad20feb195bd33abeacdc1f2d82c045b9ab2d91'
      );
    });

    const constructor = page.getByTestId('burger-constructor');

    const bunCard = page.getByTestId('ingredient-643d69a5c3f7b9001cfa093c');
    await bunCard.locator('button', { hasText: 'Добавить' }).click();

    const sauceCard = page.getByTestId('ingredient-643d69a5c3f7b9001cfa0941');
    await sauceCard.locator('button', { hasText: 'Добавить' }).click();

    const orderButton = page.getByRole('button', {
      name: 'Оформить заказ'
    });

    await expect(orderButton).toBeEnabled();

    await orderButton.click();

    const modal = page.locator('#modals');

    await expect(modal.getByText('идентификатор заказа')).toBeVisible({
      timeout: 30000
    });

    await expect(
      modal.getByRole('heading', {
        name: '109110'
      })
    ).toBeVisible();

    await page.locator('#modals button').click();

    await expect(modal.getByText('идентификатор заказа')).toHaveCount(0);

    await expect(constructor.getByText('Выберите булки')).toHaveCount(2);

    await expect(constructor.getByText('Выберите начинку')).toBeVisible();
  });
});
