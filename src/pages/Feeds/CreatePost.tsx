import { useState, useEffect, ChangeEvent } from 'react';
import { db } from '../../services/firebase';
import { collection, doc, getDoc, addDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import dbApi from '../../utils/dbApi';
import { StarIcon as SolidStar, TrashIcon, GlobeAsiaAustraliaIcon, UserIcon } from '@heroicons/react/24/solid';
import { StarIcon as LineStar } from '@heroicons/react/24/outline';
import { ReactComponent as SmileyWink } from '../../images/SmileyWink.svg';
import { showAuth } from '../../app/popUpSlice';

function CreatePost() {
  const dispatch = useAppDispatch();
  const initialInput = {
    audience: 'public',
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
  const userName = useAppSelector((state) => state.auth.currentUserName);
  const userPhotoURL = useAppSelector((state) => state.auth.currentUserPhotoURL);
  const [customTagsInput, setCustomTagsInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[][]>([]);
  const [categories, setCategories] = useState<string[][]>([]);
  const [itemsOfBrand, setItemsOfBrand] = useState<string[][][]>([]);
  const [sizesOfItem, setSizesOfItem] = useState<string[][]>([]);
  const [inputs, setInputs] = useState(initialInput);
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  // const handleDateChange = (newDate: Date) => {
  //   setDate(newDate);
  // };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newDate = new Date(value);
    setDate(newDate);
  };

  const sugarOptions = [
    '無糖',
    '一分糖',
    '二分糖',
    '三分/微糖',
    '四分糖',
    '五分/半糖',
    '六分糖',
    '七分/少糖',
    '八分糖',
    '九分糖',
    '全糖',
    '多加糖',
  ];
  const iceOptions = ['溫/熱', '去冰', '微冰', '少冰', '正常'];

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    <>
      {!currentUserId ? (
        <div className='relative mx-auto flex w-full max-w-3xl items-center justify-center rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 '>
          <div className='group hover:cursor-pointer' onClick={() => dispatch(showAuth())}>
            <span className='decoration-2 group-hover:underline'>sign in</span>
            &nbsp;to log your drinks
          </div>
          <SmileyWink className='ml-2' />
        </div>
      ) : (
        <div className='relative mx-auto flex w-full max-w-3xl flex-col rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 shadow-[4px_4px_#171717]'>
          <div className='flex h-12 flex-nowrap items-center justify-between border-b-[3px] border-solid border-neutral-900 px-5'>
            <div>
              <img
                src={userPhotoURL}
                className='mr-2 inline-block h-9 w-9 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
              />
              <span className='text-lg group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px]'>
                {userName}
              </span>
            </div>
            <div className='flex items-center justify-end gap-x-1'>
              <input
                type='datetime-local'
                value={formatDate(date)}
                onChange={handleChange}
                max={formatDate(new Date())}
                className='cursor-pointer bg-transparent outline-0 after:cursor-pointer'
              />
              <span className=''>•</span>
              {inputs.audience === 'public' ? (
                <GlobeAsiaAustraliaIcon className=' h-4 w-4 ' title='public' />
              ) : (
                <UserIcon className='h-4 w-4 ' title='private' />
              )}
              <select
                name='audience'
                id=''
                className='w-50 cursor-pointer rounded bg-transparent outline-0'
                value={inputs.audience}
                onChange={handleInputChange}
              >
                <option value='public'>public</option>
                <option value='private'>private</option>
              </select>
            </div>
          </div>
          <div className='flex flex-col gap-y-2 p-5'>
            <div className='flex text-2xl'>
              <span className=''>I drank </span>
              {/*todo: text top cut*/}
              <select
                required
                name='brandId'
                className=' grow border-b-2 border-neutral-900 bg-transparent p-0 align-baseline text-2xl text-neutral-500 focus:outline-green-400'
                value={inputs.brandId}
                onChange={(e) => {
                  handleInputChange(e);
                }}
              >
                <option value='' disabled className='w-56'>
                  select a brand
                </option>
                {brands.length !== 0 &&
                  brands.map((brand) => (
                    <option value={brand[0]} key={brand[0]} className=' align-baseline '>
                      {brand[1]}
                    </option>
                  ))}
              </select>
              <span className=''>'s </span>
              <select
                required
                disabled={itemsOfBrand.length === 0}
                name='itemId'
                className='w-1/2 grow border-b-2 border-neutral-900 bg-transparent p-0 align-baseline text-neutral-500 focus:outline-green-400'
                value={inputs.itemId}
                onChange={(e) => {
                  handleInputChange(e);
                }}
              >
                <option value='' disabled className='w-68'>
                  select a item
                </option>
                {itemsOfBrand.length !== 0 &&
                  categories.length !== 0 &&
                  itemsOfBrand.map((itemsOfCategory, index) => (
                    <optgroup label={categories[index]?.[1]} key={index} className=''>
                      {itemsOfCategory.length !== 0 &&
                        itemsOfCategory.map((item) => (
                          <option value={item[0]} key={item[0]} className='align-baseline '>
                            {item[1]}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
            </div>
            <div className='flex items-center gap-1'>
              <select
                disabled={sizesOfItem.length === 0}
                required
                name='size'
                id='size'
                className='h-8 w-16 rounded-full border-2 border-solid border-neutral-900 px-1 pt-1 text-sm'
                value={inputs.size}
                onChange={handleInputChange}
              >
                <option value='' disabled>
                  size
                </option>
                {sizesOfItem.map((option) => (
                  <option value={option[0]} key={option[0]}>
                    {option[0]}
                  </option>
                ))}
              </select>
              <span className='before:ml-3 before:content-["$"]'></span>
              <input
                required
                name='price'
                id='price'
                type='number'
                className='h-8 w-16 rounded-full border-2 border-solid border-neutral-900 p-0 px-1 pt-1 text-sm'
                value={inputs.price}
                onChange={handleInputChange}
              />
            </div>
            <div className='flex gap-x-3'>
              <div>
                <span className='text-neutral-500'>sugar_ </span>
                <select
                  required
                  name='sugar'
                  id='sugar'
                  className='h-8 w-36 rounded-full border-2 border-solid border-neutral-900 p-0 px-1 pt-1 text-sm focus:outline-green-400'
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
              </div>
              <div>
                <span className='text-neutral-500'>ice_ </span>
                <select
                  required
                  name='ice'
                  id='ice'
                  className='h-8 w-36 rounded-full border-2 border-solid border-neutral-900 p-0 px-1 pt-1 text-sm focus:outline-green-400'
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
            </div>

            <div className='flex text-amber-400'>
              {['1', '2', '3', '4', '5'].map((num) => (
                <label key={num} htmlFor={`rating-${num}`}>
                  {inputs.rating >= num ? (
                    <SolidStar className='h-8 transition-all duration-150 hover:scale-125 ' />
                  ) : (
                    <LineStar className='h-8 transition-all duration-150 hover:scale-125 ' />
                  )}

                  <input
                    id={`rating-${num}`}
                    className='hidden'
                    type='radio'
                    name='rating'
                    value={num}
                    checked={inputs.rating === num}
                    onChange={handleInputChange}
                  />
                </label>
              ))}
              {inputs.rating && (
                <div key='x' className='ml-1 text-neutral-500'>
                  <label className='cursor-pointer' htmlFor={`rating-x`}>
                    &times;
                  </label>
                  <input
                    id={`rating-x`}
                    className='hidden'
                    type='radio'
                    name='rating'
                    value={undefined}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
            <textarea
              name='selfComment'
              id='selfComment'
              className='w-full border-b-2 border-neutral-900 bg-transparent p-2 text-xl focus:outline-green-400'
              placeholder='say something'
              value={inputs.selfComment}
              onChange={handleInputChange}
            />

            <div>
              <span>#</span>
              <input
                onKeyPress={(e) => handleTagInputKeyPress(e)}
                onChange={(e) => setCustomTagsInput(e.target.value)}
                value={customTagsInput}
                type='text'
                placeholder='add your hashtags'
                className='bg-transparent focus:outline-green-400'
              />
              <div className='flex flex-wrap gap-x-3'>
                {autoTags.map(
                  (tag, index) =>
                    tag !== '' && (
                      <div key={index} className='text-neutral-400 before:mr-px before:content-["#"]'>
                        {tag}
                      </div>
                    )
                )}
                {customTags.map(
                  (tag, index) =>
                    tag !== '' && (
                      <div key={index} className=''>
                        <span className='text-neutral-400 before:mr-px before:content-["#"]'>{tag}</span>
                        <span
                          onClick={() => removeTag(index)}
                          className='ml-1 cursor-pointer text-neutral-500 hover:text-red-500'
                        >
                          &times;
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
            <button onClick={handlePostSubmit} className='button'>
              submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;
