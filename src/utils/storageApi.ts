import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface StorageApi {
  getInitPhotoURL: (photoName: string) => Promise<string>;
}

const storageApi: StorageApi = {
  async getInitPhotoURL(photoName: string) {
    const initPhotoURL = await getDownloadURL(ref(storage, photoName));
    return initPhotoURL;
  },
};

export default storageApi;
