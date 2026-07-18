import { FC, useMemo, useEffect, useState, ComponentProps } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useSelector } from '../../services/store';
import { getFeedState } from '../../services/slices/feedSlice';
import { getOrderState } from '../../services/slices/orderSlice';
import { getIngredientsState } from '../../services/slices/ingredientsSlice';
import { getOrderByNumberApi } from '../../utils/burger-api';

type TOrderInfoComponentProps = ComponentProps<typeof OrderInfoUI>['orderInfo'];

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const [externalOrder, setExternalOrder] = useState<TOrder | null>(null);

  const { orders } = useSelector(getFeedState);
  const { userOrders } = useSelector(getOrderState);
  const { ingredients } = useSelector(getIngredientsState);

  // 1. Сначала ищем заказ строго в Redux-сторах (лента или заказы юзера)
  const orderFromStore = useMemo(() => {
    if (!number) return null;
    const orderId = parseInt(number, 10);
    return (
      orders.find((item) => item.number === orderId) ||
      userOrders.find((item) => item.number === orderId) ||
      null
    );
  }, [orders, userOrders, number]);

  // 2. Определяем итоговый источник данных для отрисовки
  const orderData = orderFromStore || externalOrder;

  // 3. Запрос к API отправляем только если заказа нет в сторе и мы его ещё не загрузили извне
  useEffect(() => {
    if (!orderFromStore && !externalOrder && number) {
      getOrderByNumberApi(parseInt(number, 10))
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            setExternalOrder(data.orders[0]);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [orderFromStore, externalOrder, number]);

  // 4. Собираем информацию об ингредиентах, стоимости и дате
  const orderInfo = useMemo<TOrderInfoComponentProps | null>(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce<TIngredientsWithCount>(
      (acc, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
