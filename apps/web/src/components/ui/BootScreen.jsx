import React from "react";
import { LoaderCircle } from "lucide-react";
import Brand from "./Brand.jsx";
import Button from "./Button.jsx";

export default function BootScreen({
  message = "Preparando tu próximo paso…",
  error,
  onRetry,
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5">
      <Brand />
      {error ? (
        <p role="alert" className="max-w-[480px] text-center text-muted">
          {error}
        </p>
      ) : (
        <>
          <LoaderCircle className="animate-spin motion-reduce:animate-none" />
          <p className="text-center text-muted">{message}</p>
        </>
      )}
      {error && <Button onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}
