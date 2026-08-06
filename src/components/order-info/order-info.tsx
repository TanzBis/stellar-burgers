import { FC, useMemo, useEffect, ComponentProps } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useSelector, useDispatch } from '../../services/store';
import { getFeedState } from '../../services/slices/feedSlice';
import {
  getOrderState,
  fetchOrderByNumber,
  clearOrderByNumber
} from '../../services/slices/orderSlice';
import { getIngredientsState } from '../../services/slices/ingredientsSlice';

type TOrderInfoComponentProps = ComponentProps<typeof OrderInfoUI>['orderInfo'];

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const { orders } = useSelector(getFeedState);
  const { userOrders, orderByNumber } = useSelector(getOrderState);
  const { ingredients } = useSelector(getIngredientsState);

  const orderData = useMemo(() => {
    if (!number) return null;
    const orderId = parseInt(number, 10);

    const foundOrder =
      orders.find((item) => item.number === orderId) ||
      userOrders.find((item) => item.number === orderId);

    if (foundOrder) return foundOrder;

    if (orderByNumber && orderByNumber.number === orderId) {
      return orderByNumber;
    }

    return null;
  }, [orders, userOrders, orderByNumber, number]);

  useEffect(() => {
    if (number) {
      const orderId = parseInt(number, 10);
      dispatch(fetchOrderByNumber(orderId));
    }

    return () => {
      dispatch(clearOrderByNumber());
    };
  }, [number, dispatch]);

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
