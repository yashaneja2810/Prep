import { ReactNode } from "react";

interface FormLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default function FormLayout({ children, modal }: FormLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
} 