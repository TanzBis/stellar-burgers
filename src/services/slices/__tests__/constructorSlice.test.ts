import constructorReducer, {
  addIngredient,
  removeIngredient,
  reorderIngredients,
  clearConstructor
} from '../constructorSlice';
import { TIngredient, TConstructorIngredient } from '../../../utils/types';

describe('Редьюсер слайса burgerConstructor', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  const mockBun: TIngredient = {
    _id: '1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 1,
    fat: 2,
    carbohydrates: 3,
    calories: 4,
    price: 100,
    image: '',
    image_mobile: '',
    image_large: ''
  };

  const mockTopping: TIngredient = {
    _id: '2',
    name: 'Биокотлета',
    type: 'main',
    proteins: 10,
    fat: 20,
    carbohydrates: 30,
    calories: 40,
    price: 200,
    image: '',
    image_mobile: '',
    image_large: ''
  };

  test('должен возвращать начальное состояние при вызове с неизвестным экшеном и undefined стейтом', () => {
    const result = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  test('должен добавлять булку в стейт при вызове addIngredient с типом bun', () => {
    const actionPayload: TConstructorIngredient = {
      ...mockBun,
      id: 'mock-id-1'
    };
    const action = addIngredient(actionPayload);
    action.payload = actionPayload;

    const result = constructorReducer(initialState, action);
    expect(result.bun).toEqual(actionPayload);
    expect(result.ingredients).toHaveLength(0);
  });

  test('должен добавлять начинку в массив ingredients при вызове addIngredient', () => {
    const actionPayload: TConstructorIngredient = {
      ...mockTopping,
      id: 'mock-id-2'
    };
    const action = addIngredient(actionPayload);
    action.payload = actionPayload;

    const result = constructorReducer(initialState, action);
    expect(result.bun).toBeNull();
    expect(result.ingredients).toContainEqual(actionPayload);
    expect(result.ingredients).toHaveLength(1);
  });

  test('должен удалять ингредиент из массива по его id при вызове removeIngredient', () => {
    const item1: TConstructorIngredient = {
      ...mockTopping,
      id: 'id-to-delete'
    };
    const item2: TConstructorIngredient = { ...mockTopping, id: 'id-to-keep' };

    const stateWithItems = {
      bun: null,
      ingredients: [item1, item2]
    };

    const action = removeIngredient('id-to-delete');
    const result = constructorReducer(stateWithItems, action);

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients).toEqual([item2]);
  });

  test('должен изменять порядок ингредиентов в массиве при вызове reorderIngredients', () => {
    const item0: TConstructorIngredient = { ...mockTopping, id: 'id-0' };
    const item1: TConstructorIngredient = { ...mockTopping, id: 'id-1' };
    const item2: TConstructorIngredient = { ...mockTopping, id: 'id-2' };

    const stateWithItems = {
      bun: null,
      ingredients: [item0, item1, item2]
    };

    const action = reorderIngredients({ from: 0, to: 2 });
    const result = constructorReducer(stateWithItems, action);

    expect(result.ingredients).toEqual([item1, item2, item0]);
  });

  test('должен полностью очищать стейт при вызове clearConstructor', () => {
    const stateWithData = {
      bun: mockBun,
      ingredients: [{ ...mockTopping, id: 'id-123' }]
    };

    const action = clearConstructor();
    const result = constructorReducer(stateWithData, action);

    expect(result).toEqual(initialState);
  });
});
