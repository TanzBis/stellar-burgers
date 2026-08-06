import { FC, SyntheticEvent, useState } from 'react';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { loginUser, getUserState } from '../../services/slices/userSlice';

export const Login: FC = () => {
  const dispatch = useDispatch();
  const { error } = useSelector(getUserState);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Убрали ручной навигатор из .then(), так как ProtectedRoute сделает это автоматически при обновлении стейта user
    dispatch(loginUser({ email, password })).catch((err) => console.error(err));
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
