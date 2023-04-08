import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storageApi = {
  async getInitPhotoURL(photoName: string) {
    const initPhotoURL = await getDownloadURL(ref(storage, photoName));
    return initPhotoURL;
  }
}

export default storageApi;