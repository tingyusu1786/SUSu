/* eslint-disable */

import { auth } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  UserCredential,
  getAdditionalUserInfo,
  OAuthCredential,
} from 'firebase/auth';

interface AuthApi {
  getUserCredential: (
    type: 'signUp' | 'signIn',
    email: string,
    password: string
  ) => Promise<UserCredential | undefined>;
  getOAuthUserCredential: (type: 'google') => Promise<UserCredential | undefined>;
  getOAuthCredential: (
    type: 'google',
    OAuthUserCredential: UserCredential
  ) => Promise<OAuthCredential | null | undefined>;
  getErrorOAuthCredential: (erroe: any) => Promise<OAuthCredential | null>;
  checkIfNewUser: (OAuthUserCredential: UserCredential) => Promise<boolean | undefined>;
  updateAuthProfile: (user: UserCredential['user'], name: string | null | undefined, photoURL: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const authApi: AuthApi = {
  async getUserCredential(type, email, password) {
    let userCredential;
    if (type === 'signUp') {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else if (type === 'signIn') {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    return userCredential;
  },
  async getOAuthUserCredential(type) {
    let OAuthUserCredential;
    if (type === 'google') {
      const provider = new GoogleAuthProvider();
      OAuthUserCredential = await signInWithPopup(auth, provider);
    }
    return OAuthUserCredential;
  },
  async getOAuthCredential(type, OAuthUserCredential) {
    let OAuthCredential;
    if (type === 'google') {
      OAuthCredential = GoogleAuthProvider.credentialFromResult(OAuthUserCredential);
    }
    return OAuthCredential;
  },
  async getErrorOAuthCredential(error) {
    let errorOAuthCredential;
    errorOAuthCredential = GoogleAuthProvider.credentialFromError(error);
    return errorOAuthCredential;
  },
  async checkIfNewUser(OAuthUserCredential) {
    let isNewUser;
    let additionalUserInfo = getAdditionalUserInfo(OAuthUserCredential);
    isNewUser = additionalUserInfo?.isNewUser;
    return isNewUser;
  },
  async updateAuthProfile(user, name, photoURL) {
    await updateProfile(user, {
      displayName: name,
      photoURL: photoURL,
    });
  },
  async signOut() {
    await signOut(auth);
  },
};

export default authApi;
