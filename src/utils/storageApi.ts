import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
