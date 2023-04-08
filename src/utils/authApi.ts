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
  getUserCredential: UserCredential | undefined;
  getOAuthUserCredential: UserCredential | undefined;
  getOAuthCredential: UserCredential | undefined | null;
  checkIfNewUser: boolean | undefined;
  updateAuthProfile: void;
  signOut: void;
}

const authApi = {
  async getUserCredential(type: 'signUp' | 'signIn', email: string, password: string) {
    let userCredential;
    if (type === 'signUp') {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } else if (type === 'signIn') {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    return userCredential;
  },
  async getOAuthUserCredential(type: 'google') {
    let OAuthUserCredential;
    if (type === 'google') {
      const provider = new GoogleAuthProvider();
      OAuthUserCredential = await signInWithPopup(auth, provider);
    }
    return OAuthUserCredential;
  },
  async getOAuthCredential(type: 'google', OAuthUserCredential: UserCredential) {
    let OAuthCredential;
    if (type === 'google') {
      OAuthCredential = GoogleAuthProvider.credentialFromResult(OAuthUserCredential);
    }
    return OAuthCredential;
  },
  async getErrorOAuthCredential(error: any) {
    let errorOAuthCredential;
    errorOAuthCredential = GoogleAuthProvider.credentialFromError(error);
    return errorOAuthCredential;
  },
  async checkIfNewUser(OAuthUserCredential: UserCredential) {
    let isNewUser;
    let additionalUserInfo = getAdditionalUserInfo(OAuthUserCredential);
    isNewUser = additionalUserInfo?.isNewUser;
    return isNewUser;
  },
  async updateAuthProfile(user: UserCredential['user'], name: string | null | undefined, photoURL: string) {
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
