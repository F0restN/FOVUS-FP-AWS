import React, { useState } from 'react';
import { auth } from '../services/AWSService';
import toast, { Toaster } from 'react-hot-toast';

interface LoginPageProps {
    login: Function
}

export default function LoginPage({login}: LoginPageProps): JSX.Element {
  const [token, setToken] = useState<
    string | number | readonly string[] | undefined
  >('');

  const handleSubmit = () => {
    const isLogin =  auth(token);
    if(isLogin){
        login(isLogin)
    } else {
        toast.error('Invalid Access Token! Please try again.');
    }
  };

  return (
    <div className='flex h-screen'>
      < Toaster />
      {/*  Left Pane */}
      <div className='hidden lg:flex items-center justify-center flex-1 bg-white text-black'>
        <div className='max-w-md text-center'>
            <img className="h-auto max-w-full" src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?w=1800&t=st=1712725431~exp=1712726031~hmac=3ad179889b9c4fb6fa20a4ffd41083d7b83504fc3add13288e8f50dfbf045d80" alt="image description" />
        </div>
      </div>
      {/* Right panel */}
      <div className='w-full bg-gray-100 lg:w-1/2 flex items-center justify-center'>
        <div className='max-w-md w-full p-6'>
          <h1 className='text-3xl font-semibold mb-6 text-black text-center'>
            Welcome!
          </h1>
          <h1 className='text-sm font-semibold mb-6 text-gray-500 text-center'>
            Presented by Drake Zhou{' '}
          </h1>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Access Token
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className='mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300'
              />
            </div>
            <div>
              <button
                type='submit'
                onClick={handleSubmit}
                className='w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300'
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
