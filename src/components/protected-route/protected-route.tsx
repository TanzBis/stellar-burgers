import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { getUserState } from '../../services/slices/userSlice';
import { Preloader } from '@ui';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: React.ReactElement;
};

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children
}: TProtectedRouteProps) => {
  const { user, isAuthChecked } = useSelector(getUserState);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Если маршрут только для неавторизованных (Login, Register), но юзер УЖЕ вошел
  if (onlyUnAuth && user) {
    // Берем весь сохраненный объект location из state, либо отправляем на главную
    const from = location.state?.from || { pathname: '/' };
    return <Navigate to={from} replace />;
  }

  // Если маршрут защищенный (Profile), но юзер ЕЩЕ НЕ вошел
  if (!onlyUnAuth && !user) {
    // Сохраняем ТЕКУЩИЙ маршрут в state, чтобы вернуться на него после логина
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};
