import { FC, useMemo, ComponentProps } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useSelector } from '../../services/store';
import { getFeedState } from '../../services/slices/feedSlice';
import { getIngredientsState } from '../../services/slices/ingredientsSlice';

type TOrderInfoComponentProps = ComponentProps<typeof OrderInfoUI>['orderInfo'];

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();

  const { orders } = useSelector(getFeedState);
  const { ingredients } = useSelector(getIngredientsState);

  const orderData = useMemo(() => {
    if (!number || !orders.length) return null;
    return orders.find((item) => item.number === parseInt(number, 10)) || null;
  }, [orders, number]);

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
      ingredientsInfo, // Оставляем объект-словарь, как требует TOrderInfo в Практикуме
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
