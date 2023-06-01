import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  UserCredential,
  getAdditionalUserInfo,
  OAuthCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { auth } from '../services/firebase';
import swal from './swal';

const authApi = {
  getCurrentAuthUser() {
    return auth.currentUser;
  },
  async getUserCredential(
    type: 'signUp' | 'signIn',
    email: string,
    password: string
  ): Promise<UserCredential | undefined> {
    let userCredential;
    if (type === 'signUp') {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    } else if (type === 'signIn') {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    }
    return userCredential;
  },
  async getOAuthUserCredential(
    type: 'google'
  ): Promise<UserCredential | undefined> {
    let OAuthUserCredential;
    if (type === 'google') {
      const provider = new GoogleAuthProvider();
      OAuthUserCredential = await signInWithPopup(auth, provider);
    }
    return OAuthUserCredential;
  },
  async getOAuthCredential(
    type: 'google',
    OAuthUserCredential: UserCredential
  ): Promise<OAuthCredential | null | undefined> {
    let OAuthCredential;
    if (type === 'google') {
      OAuthCredential =
        GoogleAuthProvider.credentialFromResult(OAuthUserCredential);
    }
    return OAuthCredential;
  },
  async getErrorOAuthCredential(error: unknown) {
    let errorOAuthCredential;
    if (error instanceof FirebaseError) {
      errorOAuthCredential = GoogleAuthProvider.credentialFromError(error);
      return errorOAuthCredential;
    }
    return errorOAuthCredential;
  },
  async checkIfNewUser(
    OAuthUserCredential: UserCredential
  ): Promise<boolean | undefined> {
    const additionalUserInfo = getAdditionalUserInfo(OAuthUserCredential);
    const isNewUser = additionalUserInfo?.isNewUser;
    return isNewUser;
  },
  async updateAuthProfile(
    user: UserCredential['user'],
    content: Record<string, string>
  ): Promise<void> {
    try {
      await updateProfile(user, content);
    } catch {
      swal.error(
        'Something went wrong while updating profile',
        'try again later',
        'ok'
      );
    }
  },
  async signOut(): Promise<void> {
    await signOut(auth);
  },
  async sendResetPasswordEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },
};

export default authApi;
