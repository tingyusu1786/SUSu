import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  // showConfirmButton: true,
  // confirmButtonColor: '#4ade80',
  timer: 2500,
  timerProgressBar: true,
  customClass: {
    htmlContainer: 'absolute top-[64px]',
  },
  showClass: {
    popup: '',
    backdrop: 'swal2-backdrop-show',
    icon: 'swal2-icon-show',
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

const Error = Swal.mixin({
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
    Error.fire({ title, text, confirmButtonText });
  },
  showLoading() {
    Swal.showLoading();
  },
  hideLoading() {
    Swal.hideLoading();
  },
};

// Toast.fire({
//   icon: 'success',
//   title: 'Signed up successful 🫰',
//   confirmButtonText: 'ya',
// });

export default swal;
