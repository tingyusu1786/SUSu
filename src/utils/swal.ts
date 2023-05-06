import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { BellIcon } from '@heroicons/react/24/outline';
import { SmileyWink } from '@phosphor-icons/react';
// import SmileyWink from '../images/SmileyWink.svg';
import Meet from '../images/Meet.gif';
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
  iconHtml: 'ü',
  iconColor: '#4ade80',
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
  customClass: {
    icon: 'pt-2 px-1',
    popup: 'rotate-6',
  },
  showClass: {
    popup: 'animate__animated animate__faster animate__zoomIn',
    icon: 'animate__animated animate__rubberBand animate__repeat-2',
  },
  hideClass: {
    popup: 'animate__animated animate__faster animate__zoomOut',
  },
});

const Test = Swal.mixin({
  // icon: 'success',
  iconColor: '#4ade80',
  iconHtml: 'ü',
  backdrop: '',
  customClass: {
    icon: 'pt-2 px-1',
    popup: 'rotate-6',
    // container: 'bg-white bg-opacity-40', //大的
  },
  showClass: {
    popup: 'animate__animated animate__faster animate__zoomIn',
    icon: 'animate__animated animate__rubberBand animate__repeat-2',
  },
  hideClass: {
    popup: 'animate__animated animate__faster animate__zoomOut',
  },
  confirmButtonColor: '#4ade80',
  color: '#171717',
  background: '#f5f5f5',
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
    popup: 'rotate-6',
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
    popup: 'rotate-6',
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
  test(title: string, text: string, confirmButtonText: string) {
    Test.fire({ title, text, confirmButtonText });
  },
};

// Toast.fire({
//   icon: 'success',
//   title: 'Signed up successful 🫰',
//   confirmButtonText: 'ya',
// });

export default swal;
