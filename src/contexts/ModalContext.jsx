import React, { createContext, useContext, useState } from 'react';
import Modal from '../components/Modal';

// Create the context
const ModalContext = createContext();

/**
 * Modal Provider Component
 * Provides modal functionality to the entire application
 */
export const ModalProvider = ({ children }) => {
  // State for modal properties
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  // Helper functions to open different types of modals
  const openModal = (modalConfig) => {
    setModal({
      ...modal,
      isOpen: true,
      ...modalConfig,
    });
  };

  const showAlert = (title, message, type = 'info') => {
    openModal({
      title,
      message,
      type,
      confirmText: 'OK',
    });
  };

  const showSuccessAlert = (title, message) => {
    showAlert(title, message, 'success');
  };

  const showErrorAlert = (title, message) => {
    showAlert(title, message, 'error');
  };

  const showWarningAlert = (title, message) => {
    showAlert(title, message, 'warning');
  };

  const showConfirmationModal = (title, message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel') => {
    openModal({
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  // Close the modal
  const closeModal = () => {
    setModal({
      ...modal,
      isOpen: false,
    });
  };

  // Value to be provided to consumers
  const contextValue = {
    showAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showConfirmationModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={() => {
          modal.onConfirm();
          closeModal();
        }}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </ModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export default ModalContext; 