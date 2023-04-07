import { useState, useEffect, ChangeEvent } from 'react';
import { db } from '../../utils/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { useAppSelector } from '../../app/hooks';

function Posts() {
  const initialInput = {
    audience: 'public',
    brandId: '',
    itemId: '',
    sugar: '',
    ice: '',
    size: '',
    price: '',
    orderNum: '',
    rating: '',
    selfComment: '',
  }
  const userId = useAppSelector((state) => state.auth.userId);
  const [customTagsInput, setCustomTagsInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[][]>([]);
  const [categories, setCategories] = useState<string[][]>([]);
  const [itemsOfBrand, setItemsOfBrand] = useState<string[][][]>([]);
  const [sizesOfItem, setSizesOfItem] = useState<string[][]>([]);
  const [inputs, setInputs] = useState(initialInput);

  const sugarOptions = ['0（無糖）', '1', '2', '3（微糖）', '4', '5（半糖）', '6', '7（少糖）', '8', '9', '10（全糖）'];
  const iceOptions = ['0（去冰）', '1', '2', '3（微冰）', '4', '5', '6', '7（少冰）', '8', '9', '10（正常）', '溫/熱'];

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

  const handleTagInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && customTagsInput !== '') {
      const newTags = [...customTags, customTagsInput];
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
      authorId: userId,
      hashtags: customTags.concat(autoTags),
      timeCreated: new Date(),
      likes: [],
      comments: [],
      // serverTimeStamp: serverTimestamp(),
    });
    
    const docRef = await addDoc(collection(db, 'posts'), postInputs);


    // alert(`Document written with ID: ${docRef.id}`);
    setInputs(initialInput);
    setCustomTags([]);
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
    if (itemId !== '') {
      const idArray = itemId.split('-');
      const itemDocRef = doc(db, 'brands', idArray[0], 'categories', idArray[0] + '-' + idArray[1], 'items', itemId);
      const itemDoc = await getDoc(itemDocRef);
      if (!itemDoc.exists()) {
        console.log('No such document!');
        return '';
      }
      const itemData = itemDoc.data();
      return itemData.price;
    }
  };

  const removeTag = (index: number) => {
    setCustomTags(customTags.filter((el, i) => i !== index));
  };

  // todo: fix input focus problem

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-heal'>create post</h1>
      {userId ? (
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
          <label htmlFor='orderNum'>單號</label>
          <input
            name='orderNum'
            id='orderNum'
            type='number'
            className='border-2 border-solid border-gray-400 bg-gray-100'
            value={inputs.orderNum}
            onChange={handleInputChange}
          />
          <label htmlFor='rating'>rating</label>
          <input
            name='rating'
            id='rating'
            type='number'
            max='5'
            min='0'
            className='border-2 border-solid border-gray-400 bg-gray-100'
            value={inputs.rating}
            onChange={handleInputChange}
          />
          <label htmlFor='selfComment'>說些話吧</label>
          <input
            name='selfComment'
            id='selfComment'
            type='text'
            max='5'
            min='0'
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

export default Posts;
