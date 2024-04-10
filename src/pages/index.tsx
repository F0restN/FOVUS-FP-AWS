import React, { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import InputPage from './InputPage';

export default function Index() {
  const [isLogin, setIsLogin] = useState<boolean>(
    localStorage.getItem('validate') === 'true'
  );


  return (<div>
    {isLogin ? ( <InputPage /> ) : (<LoginPage login={setIsLogin}/>)}
  </div>);
}
