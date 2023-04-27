import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ReactComponent as SmileyWink } from '../../images/SmileyWink.svg';
const MySwal = withReactContent(Swal);

const Toast = MySwal.mixin({
  toast: true,
  // html: html,
  iconColor: '#4ade80',
  showConfirmButton: false,
  position: 'top-end',
  timer: 7000,
  timerProgressBar: true,
  showCloseButton: true,
  showClass: {
    popup: 'animate__fast animate__animated animate__slideInRight',
    icon: 'animate__fast animate__animated animate__tada',
  },
  hideClass: {
    popup: 'animate__animated animate__slideOutRight',
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const Success = Swal.mixin({
  icon: 'success',
  iconColor: '#4ade80',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
});

const Warning = Swal.mixin({
  icon: 'warning',
  iconColor: '#fbbf24',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
  showCancelButton: true,
  customClass: {
    cancelButton: 'order-1 right-gap',
    confirmButton: 'order-2',
  },
});

const ErrorSwal = Swal.mixin({
  icon: 'error',
  iconColor: '#ef4444',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
});

const swal = {
  warning(title: string, text: string, confirmButtonText: string) {
    const result = Warning.fire({ title, text, confirmButtonText });
    return result;
  },
  success(title: string, text: string, confirmButtonText: string) {
    Success.fire({ title, text, confirmButtonText });
  },
  error(title: string, text: string, confirmButtonText: string) {
    ErrorSwal.fire({ title, text, confirmButtonText });
  },
  showLoading() {
    Swal.showLoading();
  },
  hideLoading() {
    Swal.hideLoading();
  },
  toast(html: JSX.Element) {
    Toast.fire({ html });
  },
};

// Toast.fire({
//   icon: 'success',
//   title: 'Signed up successful 🫰',
//   confirmButtonText: 'ya',
// });

export default swal;
