import dbApi from '../utils/dbApi';
import { useState, useEffect, ChangeEvent } from 'react';


function Inspiration() {
  const [selectedBrands, setSelectedBrands] = useState([]);
  dbApi.getAllBrandsInfo();

  return (
    <div className='flex flex-col items-center justify-center gap-5'>
      <div className='text-center font-heal text-3xl'>what to drink today?</div>
      <div className='flex flex-col items-center justify-center'>
        <button>篩選店家</button>
        <div>(checkboxes)</div>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <button>篩選評分</button>
        <div>(checkboxes n⭐️+)</div>
      </div>
      <button className='bg-lime-300 rounded px-2 font-heal'>GO!</button>
    </div>
  );
}

export default Inspiration;
