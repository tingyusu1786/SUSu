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

// You won't be able to revert this!

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

// Swal.fire({
//   title: 'Do you really want to sign out?',
//   showCancelButton: true,
//   confirmButtonText: 'Yes',
//   customClass: {
//     cancelButton: 'order-1 right-gap',
//     confirmButton: 'order-2',
//   },
//   confirmButtonColor: '#4ade80',
// });

// Toast.fire({
//   icon: 'success',
//   confirmButtonText: 'bye',
//   title: 'signed out. see u next time 👋',
// });

// Toast.fire({
//   icon: 'error',
//   title: 'something went wrong...',
// });

// Toast.fire({
//   icon: 'success',
//   title: 'Signed up successful 🫰',
//   confirmButtonText: 'ya',
// });

// MySwal.fire({
//   title: `☹️ ${errorCode}`,
//   icon: 'error',
//   confirmButtonColor: '#b91c1c',
// });

// const result = await Swal.fire({
//   title: 'Do you want to delete this comment?',
//   text: 'this cannot be undone',
//   showCancelButton: true,
//   confirmButtonText: 'Yes',
//   customClass: {
//     cancelButton: 'order-1 right-gap',
//     confirmButton: 'order-2',
//   },
//   confirmButtonColor: '#4ade80',
// });

// Swal.fire({
//   title: 'Comment deleted!',
//   icon: 'success',
//   confirmButtonColor: '#4ade80',
//   // showClass: { popup: '' },
// });

// const result = await Swal.fire({
//   title: 'Delete this log?',
//   text: "You won't be able to revert this",
//   showCancelButton: true,
//   confirmButtonText: 'Yes',
//   customClass: {
//     cancelButton: 'order-1 right-gap',
//     confirmButton: 'order-2',
//   },
//   confirmButtonColor: '#4ade80',
// });

// Swal.fire({ title: 'Log deleted!', icon: 'success', confirmButtonColor: '#4ade80' });

// Toast.fire({
//   icon: 'success',
//   title: `Welcome back ${userData?.name} 🫰`,
//   confirmButtonText: 'hi!',
// });

// MySwal.fire({
//   title: `☹️ ${errorCode}`,
//   icon: 'error',
//   confirmButtonColor: '#b91c1c',
// });

// MySwal.fire({
//   title: `☹️ error: email used (${errEmail})`,
//   icon: 'error',
//   confirmButtonColor: '#b91c1c',
// });

// MySwal.fire({
//   title: `☹️ credential error: ${errorOAuthCredential}`,
//   icon: 'error',
//   confirmButtonColor: '#b91c1c',
// });

// Toast.fire({
//   icon: 'success',
//   title: `Hi ${user.displayName} 🫰`,
//   confirmButtonText: 'hi!',
// });

// Toast.fire({
//   icon: 'success',
//   title: `Welcome back ${user.displayName} 🫰`,
//   confirmButtonText: 'hi!',
// });

// MySwal.fire({ title: 'Profile updated!', icon: 'success', confirmButtonColor: '#4ade80' });

// MySwal.fire({
//   title: 'Something went wrong ☹ please try again',
//   icon: 'error',
//   confirmButtonColor: '#b91c1c',
// });

export default swal;
