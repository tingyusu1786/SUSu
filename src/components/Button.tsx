import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { Link } from 'react-router-dom';
import dbApi from '../utils/dbApi';

interface Props {
  type: 'confirm' | 'cancel' | 'edit';
  disabled: boolean;
}

const Button: React.FC<Props> = ({ type, disabled }) => {
  const [text, setText] = useState<string>();
  let style = 'rounded-md border-[3px] border-solid border-slate-900 w-[100px] h-[40px] ';

  useEffect(() => {
    setText(type);
  }, []);

  const handleClick = () => {
    if (disabled) {
      return;
    }
    if (type === 'confirm') {
      alert('confirm');
    } else if (type === 'cancel') {
      alert('cancel');
    } else if (type === 'edit') {
      alert('edit');
    }
  };

  if (type === 'confirm') {
    style += 'bg-green-600 text-white';
  } else if (type === 'cancel') {
    style += 'bg-red-300';
  } else if (type === 'edit') {
    style += 'bg-gray-300';
  }

  if (disabled) {
    style += ' opacity-50 cursor-not-allowed';
  }

  return (
    <button className={style} onClick={handleClick}>
      {text}
    </button>
  );
};

export default Button;
