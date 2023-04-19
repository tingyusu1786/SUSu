import { useState, useEffect, ChangeEvent } from 'react';
import { db } from '../../services/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  // setDoc,
  // serverTimestamp,
  Timestamp,
  // arrayUnion,
} from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';
import dbApi from '../../utils/dbApi';

interface DateInputProps {
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
}

const DateInput = ({ defaultDate = new Date(), onDateChange }: DateInputProps) => {
  const [year, setYear] = useState(defaultDate.getFullYear());
  const [month, setMonth] = useState(defaultDate.getMonth() + 1);
  const [date, setDate] = useState(defaultDate.getDate());
  const [hour, setHour] = useState(defaultDate.getHours());
  const [minute, setMinute] = useState(defaultDate.getMinutes());

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(parseInt(e.target.value));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(parseInt(e.target.value));
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHour(parseInt(e.target.value));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinute(parseInt(e.target.value));
  };

  const handleDateBlur = () => {
    const newDate = new Date(year, month - 1, date, hour, minute);
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  return (
    <>
      <label htmlFor='year'>Year:</label>
      <input type='number' id='year' name='year' value={year} onChange={handleYearChange} onBlur={handleDateBlur} />
      <br />

      <label htmlFor='month'>Month:</label>
      <input type='number' id='month' name='month' value={month} onChange={handleMonthChange} onBlur={handleDateBlur} />
      <br />

      <label htmlFor='date'>Date:</label>
      <input type='number' id='date' name='date' value={date} onChange={handleDateChange} onBlur={handleDateBlur} />
      <br />

      <label htmlFor='hour'>Hour:</label>
      <input type='number' id='hour' name='hour' value={hour} onChange={handleHourChange} onBlur={handleDateBlur} />
      <br />

      <label htmlFor='minute'>Minute:</label>
      <input
        type='number'
        id='minute'
        name='minute'
        value={minute}
        onChange={handleMinuteChange}
        onBlur={handleDateBlur}
      />
      <br />
    </>
  );
};

function CreatePost() {
  const initialInput = {
    audience: 'public', //todo: 改成從currentUser資料裡拿
    brandId: '',
    itemId: '',
    sugar: '',
    ice: '',
    size: '',
    price: '', //帶入的是number, 手調會變string
    orderNum: '',
    rating: '',
    selfComment: '',
  };
  const currentUserId = useAppSelector((state) => state.auth.currentUserId);
  const [customTagsInput, setCustomTagsInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[][]>([]);
  const [categories, setCategories] = useState<string[][]>([]);
  const [itemsOfBrand, setItemsOfBrand] = useState<string[][][]>([]);
  const [sizesOfItem, setSizesOfItem] = useState<string[][]>([]);
  const [inputs, setInputs] = useState(initialInput);
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  const sugarOptions = [
    '0（無糖）',
    '1（一分糖）',
    '2（二分糖）',
    '3（三分/微糖）',
    '4（四分糖）',
    '5（五分/半糖）',
    '6（六分糖）',
    '7（七分/少糖）',
    '8（八分糖）',
    '9（九分糖）',
    '10（全糖）',
    'extra（多加糖）',
  ];
  const iceOptions = ['溫/熱', '0（去冰）', '1', '2', '3（微冰）', '4', '5', '6', '7（少冰）', '8', '9', '10（正常）'];

  // 把所有brand列出來
  useEffect(() => {
    const fetchBrands = async () => {
      const brandInfos = await getBrandsIdAndName();
      setBrands(brandInfos);
    };
    fetchBrands();
  }, []);

  // 選brand之後把該brand的category列出來
  useEffect(() => {
    const fetchCategories = async () => {
      const categoryInfos = await getCategoriesIdAndName(inputs.brandId);
      setCategories(categoryInfos);
    };
    if (inputs.brandId !== '') {
      fetchCategories();
      setItemsOfBrand([]);
      setSizesOfItem([]);
    }
  }, [inputs.brandId]);

  // 有category之後把item列出來
  useEffect(() => {
    const fetchItems = async (categoryId: string) => {
      const itemInfos = await getItemsIdAndName(inputs.brandId, categoryId);
      setItemsOfBrand((itemsOfBrand) => itemsOfBrand.concat([itemInfos]));
    };

    if (categories.length !== 0) {
      categories.forEach((category) => {
        fetchItems(category[0]);
      });
    }
  }, [categories]);

  // 選item之後自動產生tag + 把size列出來
  useEffect(() => {
    handleAutoTag(inputs.itemId);

    const fetchSizes = async (itemId: string) => {
      const priceInfos = await getItemPrice(itemId);
      setSizesOfItem(Object.entries(priceInfos));
    };

    if (inputs.itemId !== '') {
      fetchSizes(inputs.itemId);
    }
  }, [inputs.itemId]);

  // sizesOfItem抓到之後如果只有一種就直接代入
  useEffect(() => {
    if (sizesOfItem.length === 1) {
      setInputs((prev) => {
        const newInput = { ...prev, size: sizesOfItem[0][0], price: sizesOfItem[0][1] };
        return newInput;
      });
    }
  }, [sizesOfItem]);

  const handleTagInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const noSpacecustomTagsInput = customTagsInput.replace(/\s/g, '');
    if (event.key === 'Enter' && noSpacecustomTagsInput !== '') {
      const newTags = [...customTags, noSpacecustomTagsInput];
      const uniqueNewTags = Array.from(new Set(newTags));
      setCustomTags(uniqueNewTags);
      setCustomTagsInput('');
    }
    return;
  };

  const handleAutoTag = (itemId: string) => {
    if (itemId !== '') {
      const idArray = itemId.split('-');
      const brandName = brands.find((brand) => brand[0] === idArray[0])?.[1] || '';
      const itemName = itemsOfBrand.flat().find(([idValue]) => idValue === itemId)?.[1] || '';
      setAutoTags([brandName, itemName]);
    } else {
      setAutoTags([]);
    }
  };

  const handlePostSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if ([inputs.brandId, inputs.itemId].some((input) => input === '')) {
      alert('please specify your drink');
      return;
    }
    const postInputs = Object.assign({}, inputs, {
      authorId: currentUserId,
      hashtags: customTags.concat(autoTags),
      timeCreated: date, //serverTimestamp()會lag
      likes: [],
      comments: [],
    });

    await addDoc(collection(db, 'posts'), postInputs);

    setInputs(initialInput);
    setCustomTags([]);
    inputs.rating !== '' && updateRatings(inputs.brandId, inputs.itemId);
  };

  const updateRatings = async (brandId: string, itemId: string) => {
    // brand
    const brandRef = doc(db, 'brands', brandId);
    const brandDoc = await getDoc(brandRef);
    const prevBrandAverageRating: number | undefined = brandDoc.data()?.averageRating;
    const prevBrandNumRatings: number | undefined = brandDoc.data()?.numRatings;
    let updatedBrandAverageRating;
    let updatedBrandNumRatings;
    if (prevBrandAverageRating && prevBrandNumRatings) {
      updatedBrandNumRatings = prevBrandNumRatings + 1;
      updatedBrandAverageRating =
        Math.round(
          ((prevBrandAverageRating * prevBrandNumRatings + Number(inputs.rating)) / updatedBrandNumRatings) * 10
        ) / 10;
    } else {
      updatedBrandNumRatings = 1;
      updatedBrandAverageRating = Number(inputs.rating);
    }

    await updateDoc(brandRef, {
      numRatings: updatedBrandNumRatings,
      averageRating: updatedBrandAverageRating,
    });

    //item
    const itemIdArray = itemId.split('-');
    const itemRef = doc(
      db,
      'brands',
      itemIdArray[0],
      'categories',
      itemIdArray[0] + '-' + itemIdArray[1],
      'items',
      itemId
    );
    const itemDoc = await getDoc(itemRef);
    const prevItemAverageRating: number | undefined = itemDoc.data()?.averageRating;
    const prevItemNumRatings: number | undefined = itemDoc.data()?.numRatings;
    let updatedItemAverageRating;
    let updatedItemNumRatings;
    if (prevItemAverageRating && prevItemNumRatings) {
      updatedItemNumRatings = prevItemNumRatings + 1;
      updatedItemAverageRating =
        Math.round(
          ((prevItemAverageRating * prevItemNumRatings + Number(inputs.rating)) / updatedItemNumRatings) * 10
        ) / 10;
    } else {
      updatedItemNumRatings = 1;
      updatedItemAverageRating = Number(inputs.rating);
    }

    await updateDoc(itemRef, {
      numRatings: updatedItemNumRatings,
      averageRating: updatedItemAverageRating,
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const key = e.target.name;
    switch (key) {
      case 'brandId': {
        setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value, itemId: '', size: '', price: '' };
          return newInput;
        });
        break;
      }
      case 'itemId': {
        setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value, size: '', price: '' };
          return newInput;
        });
        break;
      }
      case 'size': {
        setInputs((prev) => {
          const newInput = {
            ...prev,
            [key]: e.target.value,
            price: sizesOfItem[sizesOfItem.findIndex((i) => i[0] === e.target.value)]?.[1],
          };
          return newInput;
        });
        break;
      }
      default: {
        setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value };
          return newInput;
        });
      }
    }
    key === 'brandId'
      ? setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value, itemId: '' };
          return newInput;
        })
      : setInputs((prev) => {
          const newInput = { ...prev, [key]: e.target.value };
          return newInput;
        });
  };

  const handleTagsChange = (newTags: string[]) => {
    setCustomTags(newTags);
  };

  const getBrandsIdAndName = async (): Promise<string[][]> => {
    const querySnapshot = await getDocs(collection(db, 'brands'));
    const documents: string[][] = [];
    querySnapshot.forEach((doc) => {
      const docInfo = [];
      docInfo.push(doc.id);
      if (doc.data() && doc.data().name) {
        docInfo.push(doc.data().name);
      }
      documents.push(docInfo);
    });
    return documents;
  };

  const getCategoriesIdAndName = async (brandId: string): Promise<string[][]> => {
    const querySnapshot = await getDocs(collection(db, 'brands', brandId, 'categories'));
    const documents: string[][] = [];
    querySnapshot.forEach((doc) => {
      const docInfo = [];
      docInfo.push(doc.id);
      if (doc.data() && doc.data().name) {
        docInfo.push(doc.data().name);
      }
      documents.push(docInfo);
    });
    return documents;
  };

  const getItemsIdAndName = async (brandId: string, categoryId: string): Promise<string[][]> => {
    const querySnapshot = await getDocs(collection(db, 'brands', brandId, 'categories', categoryId, 'items'));
    const documents: string[][] = [];
    querySnapshot.forEach((doc) => {
      const docInfo = [];
      docInfo.push(doc.id);
      if (doc.data() && doc.data().name) {
        docInfo.push(doc.data().name);
      }
      documents.push(docInfo);
    });
    return documents;
  };

  const getItemPrice = async (itemId: string) => {
    const idArray = itemId.split('-');
    const itemDocRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', itemId);
    const itemPrice = await dbApi.getDocField(itemDocRef, 'price');
    return itemPrice;
  };

  const removeTag = (index: number) => {
    setCustomTags(customTags.filter((el, i) => i !== index));
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='font-sayger text-3xl font-bold'>create post♥︎♡</h1>
      {currentUserId ? (
        <div className='flex flex-col items-start gap-3'>
          <select
            name='audience'
            id=''
            className='w-50 rounded bg-gray-200'
            value={inputs.audience}
            onChange={handleInputChange}
          >
            <option value='public'>public</option>
            <option value='private'>private</option>
          </select>
          <button
            onClick={() => {
              setShowDate((prev) => !prev);
            }}
          >
            show date
          </button>
          <h1>{date.toString()}</h1>
          {showDate && <DateInput defaultDate={date} onDateChange={handleDateChange} />}
          <div>
            <span>我喝了</span>
            <select
              required
              name='brandId'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.brandId}
              onChange={(e) => {
                handleInputChange(e);
              }}
            >
              <option value='' disabled>
                select a brand
              </option>
              {brands.length !== 0 &&
                brands.map((brand) => (
                  <option value={brand[0]} key={brand[0]}>
                    {brand[1]}
                  </option>
                ))}
            </select>
            <span>的</span>
            <select
              required
              disabled={itemsOfBrand.length === 0}
              name='itemId'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.itemId}
              onChange={(e) => {
                handleInputChange(e);
              }}
            >
              <option value='' disabled>
                select a item
              </option>
              {itemsOfBrand.length !== 0 &&
                categories.length !== 0 &&
                itemsOfBrand.map((itemsOfCategory, index) => (
                  <optgroup label={categories[index]?.[1]} key={index}>
                    {itemsOfCategory.length !== 0 &&
                      itemsOfCategory.map((item) => (
                        <option value={item[0]} key={item[0]}>
                          {item[1]}
                        </option>
                      ))}
                  </optgroup>
                ))}
            </select>
            ！
          </div>
          <div>
            <label htmlFor='size' className=''>
              size
            </label>
            <select
              disabled={sizesOfItem.length === 0}
              required
              name='size'
              id='size'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.size}
              onChange={handleInputChange}
            >
              <option value='' disabled>
                choose size
              </option>
              {sizesOfItem.map((option) => (
                <option value={option[0]} key={option[0]}>
                  {option[0]}
                </option>
              ))}
            </select>
            <label htmlFor='price'>價錢</label>
            <input
              required
              name='price'
              id='price'
              type='number'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor='sugar'>糖</label>
            <select
              required
              name='sugar'
              id='sugar'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.sugar}
              onChange={handleInputChange}
            >
              <option value='' disabled>
                choose sugar
              </option>
              {sugarOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
            <label htmlFor='ice'>冰</label>
            <select
              required
              name='ice'
              id='ice'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.ice}
              onChange={handleInputChange}
            >
              <option value='' disabled>
                choose ice
              </option>
              {iceOptions.map((option) => (
                <option value={option} key={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {/*<label htmlFor='orderNum'>單號</label>
          <input
            name='orderNum'
            id='orderNum'
            type='number'
            className='border-2 border-solid border-gray-400 bg-gray-100'
            value={inputs.orderNum}
            onChange={handleInputChange}
          />*/}
          <label htmlFor='rating'>rating</label>
          {/*todo: 變成星星*/}
          {/*todo: 「不評分了」按鈕*/}
          <div>
            <input
              name='rating'
              id='rating'
              type='number'
              max='5'
              min='1'
              className='border-2 border-solid border-gray-400 bg-gray-100'
              value={inputs.rating}
              onChange={handleInputChange}
            />
            <small>{inputs.rating === '' && '（未評分）'}</small>
          </div>
          <label htmlFor='selfComment'>說些話吧</label>
          <input
            name='selfComment'
            id='selfComment'
            type='text'
            className='border-2 border-solid border-gray-400 bg-gray-100'
            value={inputs.selfComment}
            onChange={handleInputChange}
          />
          <div>
            <span># </span>
            <input
              onKeyPress={(e) => handleTagInputKeyPress(e)}
              onChange={(e) => setCustomTagsInput(e.target.value)}
              value={customTagsInput}
              type='text'
              placeholder='custom hashtags'
              className='border-2 border-solid border-gray-400 bg-gray-100'
            />
            <div className='w-50 flex gap-3'>
              {autoTags.map(
                (tag, index) =>
                  tag !== '' && (
                    <div key={index} className='rounded bg-gray-200'>
                      <span className='mx-3 before:content-["#"]'>{tag}</span>
                    </div>
                  )
              )}
              {customTags.map(
                (tag, index) =>
                  tag !== '' && (
                    <div key={index} className='rounded bg-gray-200'>
                      <span className='mx-3 before:content-["#"]'>{tag}</span>
                      <span
                        onClick={() => removeTag(index)}
                        className='cursor-pointer text-gray-600 hover:text-red-500'
                      >
                        &times;
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
          <button onClick={handlePostSubmit} className='rounded border-2 border-solid border-gray-400'>
            submit
          </button>
        </div>
      ) : (
        <div>please sign in to post</div>
      )}
    </div>
  );
}

export default CreatePost;
