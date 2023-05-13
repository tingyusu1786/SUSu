import { createSlice } from '@reduxjs/toolkit';

import { Brand, Item } from '../interfaces/interfaces';

export interface infoState {
  brands: {
    [brandId: string]: Brand;
  };
  items: {
    [itemId: string]: Item;
  };
  users: {
    [userId: string]: {
      name: string;
      email: string;
      photoURL: string;
    };
  };
}

const initialState: infoState = {
  brands: {},
  items: {},
  users: {},
};

export const infoSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addAllBrands: (state, action) => {
      state.brands = action.payload.allBrands;
    },
    addItem: (state, action) => {
      state.items[action.payload.itemId] = action.payload.itemInfo;
    },
    addUser: (state, action) => {
      state.users[action.payload.userId] = {
        name: action.payload.name,
        email: action.payload.email,
        photoURL: action.payload.photoURL,
      };
    },
  },
});

export const { addItem, addUser, addAllBrands } = infoSlice.actions;
export default infoSlice.reducer;
