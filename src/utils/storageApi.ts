import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import swal from './swal';

const storageApi = {
  async getInitPhotoURL(photoName: string): Promise<string> {
    const initPhotoURL = await getDownloadURL(ref(storage, photoName));
    return initPhotoURL;
  },
  async getPhotoURL(photoName: string): Promise<string | undefined> {
    try {
      const photoURL = await getDownloadURL(
        ref(storage, `userPhotos/${photoName}`)
      );
      return photoURL;
    } catch {
      swal.error('Unable to retrieve photo url', 'try again later', 'ok');
      return undefined;
    }
  },
  async uploadUserPhoto(userId: string, file: File) {
    try {
      const storageRef = ref(storage, `userPhotos/${userId}`);
      await uploadBytes(storageRef, file);
    } catch {
      swal.error('Unable to upload photo', 'try again later', 'ok');
    }
  },
};

export default storageApi;
