"use client";

export default function AdminConfirmButton({ children, message, ...props }) {
  function handleClick(event) {
    const isConfirmed = window.confirm(message || "Confirmar accion");

    if (!isConfirmed) {
      event.preventDefault();
    }
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}
