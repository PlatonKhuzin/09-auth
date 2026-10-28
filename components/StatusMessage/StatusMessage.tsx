import type { ReactNode } from "react";
import css from "./StatusMessage.module.css";
interface StatusMessageProps {
  children: ReactNode;
  error?: boolean;
}
export default function StatusMessage({
  children,
  error = false,
}: StatusMessageProps) {
  return (
    <p
      className={`${css.text} ${error ? css.error : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
