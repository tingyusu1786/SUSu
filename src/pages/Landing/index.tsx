import { useEffect, useRef } from 'react';

import Typed from 'typed.js';

function Landing() {
  const el = useRef(null);
  const typed = useRef<Typed | null>(null);

  useEffect(() => {
    if (el.current) {
      const options = {
        strings: ['Drink.^600 Log.^600 Repeat.^200 '],
        typeSpeed: 40,
        backSpeed: 30,
        loop: true,
      };
      typed.current = new Typed(el.current, options);
    }

    return () => {
      typed.current && typed.current.destroy();
    };
  }, []);

  return (
    <main className='bg-boxes flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-fixed px-36'>
      <div className='type-wrap flex-col items-center justify-start text-center text-[8vw] selection:bg-green-400'>
        <span style={{ whiteSpace: 'pre' }} ref={el} />
      </div>
    </main>
  );
}

export default Landing;
