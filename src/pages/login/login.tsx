import { FC, SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store'; // Ваш типизированный useDispatch и useSelector
import { loginUser, getUserState } from '../../services/slices/userSlice';

export const Login: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем ошибку из стора, если она возникнет при авторизации
  const { error } = useSelector(getUserState);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Отправляем данные на сервер через Redux Thunk
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        // Если вход успешен, возвращаем пользователя на сохранённый маршрут или на главную
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      })
      .catch((err) => {
        console.error('Ошибка при входе в аккаунт:', err);
      });
  };

  return (
    <LoginUI
      errorText={error || ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
