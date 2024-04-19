import { useContext, useState } from 'react';
import { Context } from '..';
import { observer } from 'mobx-react-lite';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { store } = useContext(Context);

  const handlerLogin = () => {
    store.login(email, password);
  };

  const handlerRegistration = () => {
    store.registation(email, password);
  };

  return (
    <div>
      <input
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        placeholder="Емаил"
        value={email}
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        type="text"
        placeholder="Пароль"
        value={password}
      />
      <button onClick={handlerLogin}>Логин</button>
      <button onClick={handlerRegistration}>Регистрация</button>
    </div>
  );
};

export default observer(LoginForm);
