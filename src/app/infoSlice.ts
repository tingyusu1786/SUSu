import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from './store';
import { Brand } from '../interfaces/interfaces';

export interface infoState {
  brands: {
    [brandId: string]: Brand;
  };
  items: {
    [itemId: string]: {
      name: string;
      photoURL: string;
    };
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
    // addBrand: (state, action) => {
    //   state.brands[action.payload.brandId] = {
    //     name: action.payload.name,
    //     photoURL: action.payload.photoURL,
    //   };
    // },
    addItem: (state, action) => {
      state.items[action.payload.itemId] = {
        name: action.payload.name,
        photoURL: action.payload.photoURL,
      };
    },
    addUser: (state, action) => {
      state.users[action.payload.userId] = {
        name: action.payload.name,
        email: action.payload.email,
        photoURL: action.payload.photoURL,
      };
    },
    // todo: is delete necessary?

    // deleteBrand: (state, action) => {
    //   state.isShown = false;
    //   state.content = null;
    //   state.type = null;
    // },
  },
});

export const { addItem, addUser, addAllBrands } = infoSlice.actions;
export default infoSlice.reducer;
