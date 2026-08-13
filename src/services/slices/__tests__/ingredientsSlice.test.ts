import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '../../../utils/types';

describe('Редьюсер слайса ingredients', () => {
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null
  };
  //
  const mockIngredient: TIngredient = {
    _id: '643d69a5c1674b0027e25722',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://yandex.net',
    image_mobile: 'https://yandex.net',
    image_large: 'https://yandex.net'
  };

  test('должен возвращать начальное состояние при вызове с неизвестным экшеном и undefined стейтом', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  test('должен обрабатывать экшен fetchIngredients.pending', () => {
    const action = { type: fetchIngredients.pending.type };
    const result = ingredientsReducer(initialState, action);

    expect(result).toEqual({
      ingredients: [],
      isLoading: true,
      error: null
    });
  });

  test('должен обрабатывать экшен fetchIngredients.fulfilled', () => {
    const mockPayload: TIngredient[] = [mockIngredient];
    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: mockPayload
    };

    const result = ingredientsReducer(
      { ...initialState, isLoading: true },
      action
    );

    expect(result).toEqual({
      ingredients: mockPayload,
      isLoading: false,
      error: null
    });
  });

  test('должен обрабатывать экшен fetchIngredients.rejected', () => {
    const mockErrorMessage = 'Ошибка загрузки ингредиентов';
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: mockErrorMessage }
    };

    const result = ingredientsReducer(
      { ...initialState, isLoading: true },
      action
    );

    expect(result).toEqual({
      ingredients: [],
      isLoading: false,
      error: mockErrorMessage
    });
  });
});
