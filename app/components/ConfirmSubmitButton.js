"use client";

export default function ConfirmSubmitButton({ children, message, ...props }) {
  function handleClick(event) {
    if (message && !window.confirm(message)) {
      event.preventDefault();
    }
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}
