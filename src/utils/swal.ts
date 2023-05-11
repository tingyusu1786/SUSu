import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const Toast = MySwal.mixin({
  toast: true,
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
  iconHtml: 'ü',
  iconColor: '#4ade80',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
  customClass: {
    icon: 'pt-2 px-1',
    popup: '',
  },
  showClass: {
    popup: 'animate__animated animate__faster animate__zoomIn',
    icon: 'animate__animated animate__rubberBand animate__repeat-2',
  },
  hideClass: {
    popup: 'animate__animated animate__faster animate__zoomOut',
  },
});

const Warning = Swal.mixin({
  iconHtml: 'ö',
  iconColor: '#fbbf24',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
  showCancelButton: true,
  customClass: {
    cancelButton: 'order-1 right-gap',
    confirmButton: 'order-2',
    icon: 'pt-2 px-1',
    popup: '',
  },
  showClass: {
    popup: 'animate__animated animate__faster animate__zoomIn',
    icon: 'animate__animated animate__rubberBand animate__repeat-2',
  },
  hideClass: {
    popup: 'animate__animated animate__faster animate__zoomOut',
  },
});

const ErrorSwal = Swal.mixin({
  iconHtml: '✖︎',
  iconColor: '#ef4444',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
  customClass: {
    icon: 'pt-3 px-1',
    popup: '',
  },
  showClass: {
    popup: 'animate__animated animate__faster animate__zoomIn',
    icon: 'animate__animated animate__rubberBand animate__repeat-2',
  },
  hideClass: {
    popup: 'animate__animated animate__faster animate__zoomOut',
  },
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

export default swal;
