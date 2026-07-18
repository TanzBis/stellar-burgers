import { FC, SyntheticEvent, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { registerUser, getUserState } from '../../services/slices/userSlice';

export const Register: FC = () => {
  const dispatch = useDispatch();
  const { error } = useSelector(getUserState);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!userName || !email || !password) return;

    // Убрали ручной навигатор из .then(), ликвидировав гонку редиректов по чеклисту
    dispatch(registerUser({ name: userName, email, password })).catch((err) =>
      console.error(err)
    );
  };

  return (
    <RegisterUI
      errorText={error || ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
