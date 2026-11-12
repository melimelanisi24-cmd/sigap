import { useEffect, useState } from 'react';

const icons = {
  success: (
    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  error: (
    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  ),
  info: (
    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
};

export function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Masuk
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Keluar setelah 3.5 detik
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3500);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [onClose]);

  const colorMap = {
    success: 'border-green-200 bg-white',
    error:   'border-red-200 bg-white',
    info:    'border-blue-200 bg-white',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl max-w-sm w-full transition-all duration-300
        ${colorMap[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-snug">{message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Hook sederhana untuk manajemen toast
// oxlint-disable-next-line react/only-export-components
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const hideToast = () => setToast(null);

  const ToastContainer = toast ? (
    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastContainer };
}
