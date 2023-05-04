import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
import { db } from '../../services/firebase';
import { collection, doc, getDoc, addDoc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import dbApi from '../../utils/dbApi';
import swal from '../../utils/swal';
import { StarIcon as SolidStar, GlobeAsiaAustraliaIcon, UserIcon } from '@heroicons/react/24/solid';
import { StarIcon as LineStar } from '@heroicons/react/24/outline';
import { ReactComponent as SmileyWink } from '../../images/SmileyWink.svg';
import { showAuth } from '../../app/popUpSlice';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimeField } from '@mui/x-date-pickers/DateTimeField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

function useComponentVisible(initialIsVisible: boolean) {
  const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return { ref, isComponentVisible, setIsComponentVisible };
}

function CreatePost() {
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(true);
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
  const initialDropdownShown = {
    audience: false,
    brand: false,
    item: false,
    size: false,
    sugar: false,
    ice: false,
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
  // const [date, setDate] = useState<Date>(new Date(Date.now() - new Date().getTimezoneOffset() * 60000));
  const [date, setDate] = useState<dayjs.Dayjs | null>(dayjs());

  const [dropdownShown, setDropdownShown] = useState(initialDropdownShown);

  const formatDate = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = event.target;
  //   if (value === '' || parseInt(value.split('-')[0]) > 9999) {
  //     return;
  //   }

  //   let newDate = new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60000);
  //   setDate(newDate);
  // };

  const handleChange = (event: any) => {
    const { value } = event.target;
    console.log(value);
    if (value === '' || parseInt(value.split('-')[0]) > 9999) {
      return;
    }

    // let newDate = new Date(new Date(value).getTime() - new Date().getTimezoneOffset() * 60000);
    // setDate(newDate);
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
  const iceOptions = ['溫/熱', '去冰', '微冰', '少冰', '正常冰'];

  // 把所有brand列出來
  useEffect(() => {
    const fetchBrands = async () => {
      const brandInfos = await getBrandsIdAndName();
      brandInfos && setBrands(brandInfos);
    };
    fetchBrands();
  }, []);

  // 選brand之後把該brand的category列出來
  useEffect(() => {
    const fetchCategories = async () => {
      const categoryInfos = await getCategoriesIdAndName(inputs.brandId);
      categoryInfos && setCategories(categoryInfos);
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
      itemInfos && setItemsOfBrand((itemsOfBrand) => itemsOfBrand.concat([itemInfos]));
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
      priceInfos && setSizesOfItem(Object.entries(priceInfos));
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

  const handleTagInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const noSpacecustomTagsInput = customTagsInput.replace(/\s/g, '');
    if (noSpacecustomTagsInput !== '') {
      const newTags = [...customTags, noSpacecustomTagsInput];
      const uniqueNewTags = Array.from(new Set(newTags));
      setCustomTags(uniqueNewTags);
      setCustomTagsInput('');
    }
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
    try {
      if ([inputs.brandId, inputs.itemId, inputs.rating].some((input) => input === '')) {
        swal.warning('please fill in all required fields', '(brand, item, rating)', 'ok');
        return;
      }
      // todo: invalid date
      const postInputs = Object.assign({}, inputs, {
        authorId: currentUserId,
        hashtags: customTags.concat(autoTags),
        // timeCreated: new Date(date.getTime() + new Date().getTimezoneOffset() * 60000), //serverTimestamp()會lag
        timeCreated: new Date(date!.unix() * 1000),
        likes: [],
        comments: [],
      });

      await addDoc(collection(db, 'posts'), postInputs);

      setInputs(initialInput);
      setCustomTags([]);
      inputs.rating !== '' && updateRatings(inputs.brandId, inputs.itemId);
      swal.success('log successfully!', '', 'ok');
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  };

  const updateRatings = async (brandId: string, itemId: string) => {
    try {
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
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const key = e.target.name;

    interface UpdateFunctions {
      [key: string]: () => { [key: string]: string | undefined };
      default: () => { [key: string]: string };
    }

    const updateFunctions: UpdateFunctions = {
      brandId: () => ({ brandId: e.target.value, itemId: '', size: '', price: '' }),
      itemId: () => ({ itemId: e.target.value, size: '', price: '' }),
      size: () => {
        const price = sizesOfItem.find((i) => i[0] === e.target.value)?.[1];
        return { size: e.target.value, price };
      },
      price: () => ({ price: parseInt(e.target.value) < 0 ? '0' : e.target.value }),
      default: () => ({ [key]: e.target.value }),
    };

    const updateInputs = updateFunctions[key] || updateFunctions.default;
    setInputs((prev) => ({ ...prev, ...updateInputs() }));
  };

  const handleTagsChange = (newTags: string[]) => {
    setCustomTags(newTags);
  };

  const getBrandsIdAndName = async (): Promise<string[][] | undefined> => {
    try {
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
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  };

  const getCategoriesIdAndName = async (brandId: string): Promise<string[][] | undefined> => {
    try {
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
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  };

  const getItemsIdAndName = async (brandId: string, categoryId: string): Promise<string[][] | undefined> => {
    try {
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
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
  };

  const getItemPrice = async (itemId: string): Promise<Record<string, string> | undefined> => {
    try {
      const idArray = itemId.split('-');
      const itemDocRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', itemId);
      const itemPrice = await dbApi.getDocField(itemDocRef, 'price');
      return itemPrice;
    } catch {
      swal.error('something went wrong', '', 'ok');
    }
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
        <div
          className='relative mx-auto flex w-full max-w-3xl flex-col rounded-md border-[3px] border-solid border-neutral-900 bg-neutral-100 shadow-[4px_4px_#171717]'
          onClick={() => {
            if (Object.values(dropdownShown).some((show) => show === true)) {
              console.log('div on click');
              setDropdownShown(initialDropdownShown);
            }
          }}
        >
          <div className='flex h-12 flex-nowrap items-center justify-between border-b-[3px] border-solid border-neutral-900 px-5'>
            <div>
              <img
                src={userPhotoURL}
                alt={userName || 'user'}
                className='mr-2 inline-block h-9 w-9 rounded-full border-2 border-solid border-neutral-900 object-cover group-hover:border-green-400'
              />
              <span className='text-lg group-hover:underline group-hover:decoration-green-400 group-hover:decoration-wavy group-hover:underline-offset-[5px]'>
                {userName}
              </span>
            </div>
            <div className='flex items-center justify-end gap-x-1'>
              <DateTimePicker
                value={dayjs(date)}
                maxDateTime={dayjs()}
                onChange={(newValue) =>
                  setDate((prev) => {
                    console.log(date);
                    return newValue;
                  })
                }
              />

              {/*<input
                required
                type='datetime-local'
                value={formatDate(date)}
                onChange={handleChange}
                max={formatDate(new Date(Date.now() - new Date().getTimezoneOffset() * 60000))}
                className='w-full cursor-pointer bg-transparent outline-0 after:cursor-pointer'
              />*/}
              <span className=''>•</span>
              {inputs.audience === 'public' ? (
                <GlobeAsiaAustraliaIcon className=' h-4 w-4 ' title='public' />
              ) : (
                <UserIcon className='h-4 w-4 ' title='private' />
              )}
              <div className='w-50 cursor-pointer '>
                <button
                  onClick={() =>
                    setDropdownShown((prev) => {
                      const newShown = { ...prev };
                      newShown.audience = !newShown.audience;
                      return newShown;
                    })
                  }
                  className=''
                >
                  {inputs.audience}
                </button>
                <div
                  className={`flex ${
                    !dropdownShown.audience && 'hidden'
                  } absolute z-10 w-24 flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-1 shadow-lg`}
                >
                  <label className='cursor-pointer px-1 pt-1 text-center text-base hover:bg-neutral-100'>
                    public
                    <input
                      type='radio'
                      name='audience'
                      value='public'
                      className='hidden'
                      onChange={(e) => {
                        handleInputChange(e);
                      }}
                    ></input>
                  </label>
                  <label className='cursor-pointer px-3 pt-1 text-center text-base hover:bg-neutral-100'>
                    private
                    <input
                      type='radio'
                      name='audience'
                      value='private'
                      className='hidden'
                      onChange={(e) => {
                        handleInputChange(e);
                      }}
                    ></input>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-y-2 p-5'>
            <div className='flex items-center gap-x-2 text-xl'>
              <span className=''>I drank </span>
              <div className='relative w-56'>
                <button
                  onClick={() =>
                    setDropdownShown((prev) => {
                      const newShown = { ...prev };
                      newShown.brand = !newShown.brand;
                      return newShown;
                    })
                  }
                  className='h-10 w-full grow rounded-full border-2 border-solid border-neutral-900 bg-white p-0 px-2 pt-1 text-base focus:outline focus:outline-green-400'
                >
                  {inputs.brandId ? brands.find((brand) => brand[0] === inputs.brandId)![1] : 'select a brand'}
                </button>
                <div
                  className={`flex gap-y-1 ${
                    !dropdownShown.brand && 'hidden'
                  } absolute z-10 max-h-[305px] w-full flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-2 shadow-lg`}
                >
                  {brands.length !== 0 &&
                    brands.map((brand) => (
                      <label className='cursor-pointer px-3 pt-1 text-center text-base hover:bg-neutral-100'>
                        {brand[1]}
                        <input
                          type='radio'
                          name='brandId'
                          value={brand[0]}
                          key={brand[0]}
                          className='hidden'
                          onChange={(e) => {
                            console.log('onChange');
                            handleInputChange(e);
                          }}
                        ></input>
                      </label>
                    ))}
                </div>
              </div>

              <span className=''>'s </span>

              <div className='relative w-60'>
                <button
                  disabled={itemsOfBrand.length === 0}
                  onClick={() =>
                    setDropdownShown((prev) => {
                      const newShown = { ...prev };
                      newShown.item = !newShown.item;
                      return newShown;
                    })
                  }
                  className={`h-10 w-full grow rounded-full border-2 border-solid border-neutral-900 bg-white p-0 px-2 pt-1 text-base focus:outline focus:outline-green-400 ${
                    itemsOfBrand.length === 0 && 'cursor-not-allowed opacity-60'
                  }`}
                >
                  {inputs.itemId ? itemsOfBrand.flat().find((item) => item[0] === inputs.itemId)![1] : 'select an item'}
                </button>
                <div
                  className={`flex gap-y-1 ${
                    !dropdownShown.item && 'hidden'
                  } absolute z-10 max-h-[305px] w-full flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-2 shadow-lg`}
                >
                  {itemsOfBrand.length !== 0 &&
                    categories.length !== 0 &&
                    itemsOfBrand.map((itemsOfCategory, index) => (
                      <div className='flex flex-col'>
                        <div className='flex w-full items-center justify-around gap-3 px-6'>
                          <div className='grow border-b border-dashed border-neutral-500'></div>
                          <div className='mt-1 text-center text-base text-neutral-500'>{categories[index]?.[1]}</div>
                          <div className='grow border-b border-dashed border-neutral-500'></div>
                        </div>
                        {itemsOfCategory.length !== 0 &&
                          itemsOfCategory.map((item) => (
                            <label className='cursor-pointer px-3 pt-1 text-center text-base hover:bg-neutral-100'>
                              {item[1]}
                              <input
                                type='radio'
                                name='itemId'
                                value={item[0]}
                                key={item[0]}
                                className='hidden'
                                onChange={(e) => {
                                  console.log('onChange');
                                  handleInputChange(e);
                                }}
                              />
                            </label>
                          ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <div className='relative h-8 w-16'>
                <button
                  disabled={sizesOfItem.length === 0}
                  onClick={() =>
                    setDropdownShown((prev) => {
                      const newShown = { ...prev };
                      newShown.size = !newShown.size;
                      return newShown;
                    })
                  }
                  className={`h-full w-full grow rounded-full border-2 border-solid border-neutral-900 bg-white p-0 px-2 pt-1 text-base text-sm focus:outline focus:outline-green-400 ${
                    sizesOfItem.length === 0 && 'cursor-not-allowed opacity-60'
                  }`}
                >
                  {inputs.size || 'size'}
                </button>
                <div
                  className={`flex gap-y-1 ${
                    !dropdownShown.size && 'hidden'
                  } absolute z-10 w-full flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-2 shadow-lg`}
                >
                  {sizesOfItem.length !== 0 &&
                    sizesOfItem.map((size) => (
                      <label className='cursor-pointer px-3 pt-1 text-center text-sm hover:bg-neutral-100'>
                        {size[0]}
                        <input
                          type='radio'
                          name='size'
                          value={size[0]}
                          key={size[0]}
                          className='hidden'
                          onChange={(e) => {
                            handleInputChange(e);
                          }}
                        ></input>
                      </label>
                    ))}
                </div>
              </div>

              <span className='before:ml-3 before:content-["$"]'></span>
              <input
                disabled={sizesOfItem.length === 0}
                name='price'
                id='price'
                type='number'
                className={`h-8 w-16 rounded-full border-2 border-solid border-neutral-900 bg-white px-2 pb-0 pt-1 text-center text-sm focus:outline focus:outline-green-400 ${
                  sizesOfItem.length === 0 && 'cursor-not-allowed opacity-60'
                }`}
                value={inputs.price}
                onChange={handleInputChange}
              />
            </div>
            <div className='flex gap-x-3'>
              <div className='flex items-center gap-1'>
                <span className='text-neutral-500'>sugar </span>
                <div className='relative h-8 w-36'>
                  <button
                    className={`h-full w-full rounded-full border-2 border-solid border-neutral-900 bg-white p-0 px-2 pt-1 text-base text-sm focus:outline focus:outline-green-400`}
                    onClick={() =>
                      setDropdownShown((prev) => {
                        const newShown = { ...prev };
                        newShown.sugar = !newShown.sugar;
                        return newShown;
                      })
                    }
                  >
                    {inputs.sugar || 'choose sugar'}
                  </button>
                  <div
                    className={`flex gap-y-1 ${
                      !dropdownShown.sugar && 'hidden'
                    } absolute z-10 w-full flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-2 shadow-lg`}
                  >
                    {sugarOptions.map((option) => (
                      <label className='cursor-pointer px-3 pt-1 text-center text-sm hover:bg-neutral-100'>
                        {option}
                        <input
                          type='radio'
                          name='sugar'
                          value={option}
                          key={option}
                          className='hidden'
                          onChange={(e) => {
                            handleInputChange(e);
                          }}
                        ></input>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-neutral-500'>ice </span>
                <div className='relative h-8 w-36'>
                  <button
                    className={`h-full w-full rounded-full border-2 border-solid border-neutral-900 bg-white p-0 px-2 pt-1 text-base text-sm focus:outline focus:outline-green-400`}
                    onClick={() =>
                      setDropdownShown((prev) => {
                        const newShown = { ...prev };
                        newShown.ice = !newShown.ice;
                        return newShown;
                      })
                    }
                  >
                    {inputs.ice || 'choose ice'}
                  </button>
                  <div
                    className={`flex gap-y-1 ${
                      !dropdownShown.ice && 'hidden'
                    } absolute z-10 w-full flex-col overflow-y-scroll rounded-lg border border-neutral-900 bg-white py-2 shadow-lg`}
                  >
                    {iceOptions.map((option) => (
                      <label className='cursor-pointer px-3 pt-1 text-center text-sm hover:bg-neutral-100'>
                        {option}
                        <input
                          type='radio'
                          name='ice'
                          value={option}
                          key={option}
                          className='hidden'
                          onChange={(e) => {
                            handleInputChange(e);
                          }}
                        ></input>
                      </label>
                    ))}
                  </div>
                </div>
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
              className='w-full rounded-lg border-2 border-neutral-900 p-2 placeholder:text-neutral-400 focus:outline focus:outline-green-400'
              placeholder='say something'
              value={inputs.selfComment}
              onChange={handleInputChange}
            />

            <div>
              <span className='mr-1 text-neutral-600'>#</span>
              <input
                onBlur={(e) => handleTagInputBlur(e)}
                onKeyPress={(e) => handleTagInputKeyPress(e)}
                onChange={(e) => setCustomTagsInput(e.target.value)}
                value={customTagsInput}
                type='text'
                placeholder='add your own hashtags'
                className='inline-block h-7 rounded-lg border-2 border-solid border-neutral-900 p-0 px-1 text-neutral-600 placeholder:text-sm placeholder:text-neutral-400 focus:outline focus:outline-green-400'
              />
              <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                {customTags.map(
                  (tag, index) =>
                    tag !== '' && (
                      <div key={index} className='mt-2'>
                        <span className='text-neutral-600 before:mr-px before:content-["#"]'>{tag}</span>
                        <span onClick={() => removeTag(index)} className='ml-1 cursor-pointer text-neutral-500'>
                          &times;
                        </span>
                      </div>
                    )
                )}
                {autoTags.map(
                  (tag, index) =>
                    tag !== '' && (
                      <div key={index} className='mt-2 text-neutral-600 before:mr-px before:content-["#"]'>
                        {tag}
                      </div>
                    )
                )}
              </div>
            </div>
            <button
              onClick={handlePostSubmit}
              className='button mt-2 h-10 rounded-full bg-green-300 hover:bg-green-400 focus:outline-none'
            >
              submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CreatePost;
