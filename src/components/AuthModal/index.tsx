import { useState, useEffect, ChangeEvent } from 'react';

import { Eye, EyeClosed } from '@phosphor-icons/react';
import 'animate.css';
import { serverTimestamp } from 'firebase/firestore';

import { signInStart, signInSuccess, signInFail } from '../../redux/authSlice';
import { useAppDispatch } from '../../redux/hooks';
import { closeAuth } from '../../redux/popUpSlice';
import authApi from '../../utils/authApi';
import dbApi from '../../utils/dbApi';
import storageApi from '../../utils/storageApi';
import swal from '../../utils/swal';

function Authentication() {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState({
    name: '',
    email: 'suesue@gmail.com',
    password: 'suesue',
  });
  const [haveAccount, setHaveAccount] = useState(true);
  const [passwordType, setPasswordType] = useState('password');

  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === 'Escape') {
        dispatch(closeAuth());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNativeSignUp = async (
    name: string,
    email: string,
    password: string
  ) => {
    if ([name, email, password].some((value) => value === '')) {
      return;
    }
    try {
      dispatch(signInStart());
      const userCredential = await authApi.getUserCredential(
        'signUp',
        email,
        password
      );
      if (userCredential === undefined) {
        throw new Error();
      }
      const user = userCredential.user;
      const imgUrl = (await storageApi.getPhotoURL('initPhoto.png')) || '';
      await authApi.updateAuthProfile(user, { name, imgUrl });
      await dbApi.createNewUser(user.uid, {
        name,
        email,
        photoURL: imgUrl,
        timeCreated: new Date(),
      });
      swal.informToast('Signed up successful!');
      dispatch(
        signInSuccess({
          user: {
            name,
            email,
            photoURL: imgUrl,
          },
          id: user.uid,
        })
      );
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      swal.error(`☹️ ${errorCode}`, 'try again', 'ok');
      dispatch(signInFail(errorMessage));
      dispatch(closeAuth());
    }
  };

  const nativeSignIn = async (email: string, password: string) => {
    try {
      dispatch(signInStart());
      const userCredential = await authApi.getUserCredential(
        'signIn',
        email,
        password
      );
      if (userCredential === undefined) {
        throw new Error();
      }
      const userId = userCredential.user.uid;
      const userName = await dbApi.getUserField(userId, 'name');

      swal.informToast(`Welcome back ${userName}!`);
    } catch (error: any) {
      const errorCode = error.code;
      swal.error(`☹️ ${errorCode}`, 'try again', 'ok');
      dispatch(signInFail(errorCode));
      dispatch(closeAuth());
    }
  };

  const googleSignIn = async () => {
    try {
      dispatch(signInStart());
      const OAuthUserCredential = await authApi.getOAuthUserCredential(
        'google'
      );
      if (OAuthUserCredential === undefined) {
        throw new Error();
      }
      const OAuthCredential = await authApi.getOAuthCredential(
        'google',
        OAuthUserCredential
      );
      if (OAuthCredential === undefined) {
        throw new Error();
      }

      if (OAuthCredential !== null) {
        const user = OAuthUserCredential.user;
        const isNewUser = await authApi.checkIfNewUser(OAuthUserCredential);
        if (isNewUser === undefined) {
          throw new Error();
        }
        if (isNewUser && user.displayName && user.email && user.photoURL) {
          await dbApi.createNewUser(user.uid, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            timeCreated: new Date(),
          });
          swal.informToast(`Hi ${user.displayName}!`);
        } else {
          swal.informToast(`Welcome back ${user.displayName} 🫰`);
        }
      }
    } catch (error: any) {
      const errorCode = error.code;
      swal.error(`☹️ ${errorCode}`, 'try again', 'ok');
      dispatch(signInFail(errorCode));
      dispatch(closeAuth());

      const errEmail = error.customData.email;
      swal.error(`☹️ error: email used (${errEmail})`, 'try again', 'ok');

      const errorOAuthCredential = await authApi.getErrorOAuthCredential(error);
      swal.error(
        `☹️ credential error: ${errorOAuthCredential}`,
        'try again',
        'ok'
      );
    }
  };

  const handleReset = () => {
    setInput({ name: '', email: '', password: '' });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    setInput(() => {
      return { ...input, [key]: e.target.value };
    });
  };

  return (
    <div className='fixed top-0 z-50 flex h-screen w-screen items-center justify-center'>
      <form className='animate__faster animate__animated animate__zoomIn z-30  flex w-96 flex-col items-center justify-start gap-3 rounded-md border-[3px] border-solid border-neutral-900 bg-[#F5F3EA] bg-neutral-100 px-4 py-5 shadow-[4px_4px_#171717]'>
        <div className='text-2xl'>SUSü</div>

        <div className='mb-3 text-center text-lg font-bold'>
          {haveAccount ? 'Welcome back!' : 'Start logging your drinks ;)'}
        </div>
        <button
          onClick={googleSignIn}
          className='button mb-3 h-10 w-full rounded-full bg-green-300 p-0 text-xl transition-all duration-100 hover:bg-green-400 focus:outline focus:outline-green-400'
        >
          continue with Google
        </button>
        <div className='flex w-full items-baseline justify-around gap-3 px-6'>
          <div className='grow border-b border-solid border-neutral-400' />
          <span className='text-sm'>or</span>
          <div className='grow border-b border-solid border-neutral-400' />
        </div>
        {!haveAccount && (
          <label className='flex w-full flex-col'>
            <span className='ml-4'>name</span>
            <input
              id='name'
              name='name'
              type='text'
              className='h-10 w-full rounded-full border-2 border-solid border-neutral-400 p-3 focus:outline-green-400'
              value={input.name}
              onChange={handleInputChange}
              autoComplete='name'
              required
            />
          </label>
        )}
        <label className='flex w-full flex-col'>
          <span className='ml-4'>email</span>
          <input
            id='email'
            name='email'
            type='text'
            placeholder='suesue@gmail.com (public account)'
            className='h-10 w-full rounded-full border-2 border-solid border-neutral-400 p-3 focus:outline-green-400'
            value={input.email}
            onChange={handleInputChange}
            autoComplete={haveAccount ? 'email' : 'off'}
            required
          />
        </label>
        <label className='flex w-full flex-col mb-5'>
          <span className='ml-4'>password</span>
          <div className='relative'>
            <input
              id='password'
              type={passwordType}
              name='password'
              placeholder='suesue (public account password)'
              className='h-10 w-full rounded-full border-2 border-solid border-neutral-400 p-3 focus:outline-green-400'
              value={input.password}
              onChange={handleInputChange}
              autoComplete={haveAccount ? 'current-password' : 'new-password'}
              required
            />
            {passwordType === 'password' ? (
              <EyeClosed
                size={20}
                weight='bold'
                color='#a3a3a3'
                className='absolute right-4 top-[0.6rem] cursor-pointer hover:fill-green-400'
                onClick={() => {
                  setPasswordType((prev) =>
                    prev === 'password' ? 'text' : 'password'
                  );
                }}
              />
            ) : (
              <Eye
                size={20}
                weight='bold'
                color='#a3a3a3'
                className='absolute right-4 top-[0.6rem] cursor-pointer hover:fill-green-400'
                onClick={() => {
                  setPasswordType((prev) =>
                    prev === 'password' ? 'text' : 'password'
                  );
                }}
              />
            )}
          </div>
        </label>

        {haveAccount ? (
          <button
            onClick={() => {
              nativeSignIn(input.email, input.password);
            }}
            className='button mb-3 h-10 w-full rounded-full bg-white p-0 text-xl transition-all duration-100 hover:bg-green-400 focus:outline focus:outline-green-400'
          >
            Sign in
          </button>
        ) : (
          <button
            onClick={() => {
              handleNativeSignUp(input.name, input.email, input.password);
            }}
            className='button mb-3 h-10 w-full rounded-full bg-white p-0 text-xl transition-all duration-100 hover:bg-green-400 focus:outline focus:outline-green-400'
          >
            Sign up
          </button>
        )}

        {haveAccount ? (
          <div className='text-sm'>
            <span>Don&rsquo;t have an account? </span>
            <span
              className='cursor-pointer hover:underline'
              onClick={() => {
                setHaveAccount(false);
                handleReset();
              }}
              aria-label='Create an account'
            >
              Sign up
            </span>
          </div>
        ) : (
          <div className='text-sm'>
            <span>Already have an account? </span>
            <span
              className='cursor-pointer hover:underline'
              onClick={() => {
                setHaveAccount(true);
              }}
              aria-label='Log in with email'
            >
              Sign in
            </span>
          </div>
        )}
      </form>
      <div
        className='absolute top-0 h-full w-full bg-white opacity-80'
        onClick={() => dispatch(closeAuth())}
      />
    </div>
  );
}

export default Authentication;
