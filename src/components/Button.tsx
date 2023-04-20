import React, { useState, useEffect } from 'react';

interface Props {
  type?: 'confirm' | 'cancel' | 'edit';
  disabled: boolean;
  onClick: any;
  children: string;
  liked?: boolean;
}

const Button: React.FC<Props> = ({ type, disabled, onClick, children, liked }) => {
  const [text, setText] = useState<string>();
  let style =
    'rounded border-2 border-solid border-slate-900 pt-1 font-sayger shadow-[3px_3px_#171717] active:shadow-[1px_1px_#171717] ';
  if (!disabled) {
    style += 'active:translate-y-0.5 ';
  }

  // if (disabled) {
  //   style += 'opacity-70 ';
  // }

  if (liked) {
    style += 'bg-[#3ddc84] ';
  }

  useEffect(() => {
    setText(type);
  }, []);

  const title = disabled ? 'please log in to like' : 'like';

  return (
    <button className={style} onClick={onClick} title={title}>
      {children}
    </button>
  );
};

export default Button;
