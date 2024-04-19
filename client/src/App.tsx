import { useContext, useEffect, useState } from 'react';
import LoginForm from './components/LoginForm';
import { Context } from '.';
import { ACCESS_TOKEN_LOCAL_STORAGE_KEY } from './http';
import { observer } from 'mobx-react-lite';
import UserService from './services/UserService';
import { IUser } from './models/IUser';

function App() {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)) {
      store.checkAuth();
    }
  }, []);

  async function getUsers() {
    try {
      const res = await UserService.fetchUsers().then((data) => data);
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  if (store.isLoading) return <h1>Loading</h1>;

  if (!store.isAuth) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>
        {store.isAuth
          ? `Пользователь авторизован ${store.user.email}`
          : 'Пользователь не авторизован'}
      </h1>
      <button onClick={() => store.logout()}>Выйти</button>
      <div>
        <button onClick={getUsers}>Получить пользователей</button>
        <div>
          {users.map((user) => (
            <div key={user.id}>{user.email}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default observer(App);
