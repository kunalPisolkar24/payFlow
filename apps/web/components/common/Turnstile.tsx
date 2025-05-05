"use client";

import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

interface TurnstileComponentProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  options?: { theme?: "light" | "dark" | "auto" };
}

export interface TurnstileRefActions {
  reset: () => void;
}

export const TurnstileComponent = forwardRef<
  TurnstileRefActions,
  TurnstileComponentProps
>(({ siteKey, onVerify, onError, onExpire, options }, ref) => {
  const [token, setToken] = useState<string | null>(null);
  const turnstileInternalRef = useRef<TurnstileInstance>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      turnstileInternalRef.current?.reset();
      setToken(null);
    },
  }));

  const handleSuccess = (verifiedToken: string) => {
    setToken(verifiedToken);
    onVerify(verifiedToken);
  };

  const handleError = (error: any) => {
    console.error("Turnstile Error:", error);
    setToken(null); 
    onError?.(error);
  };

  const handleExpire = () => {
    setToken(null);
    onExpire?.();
  }

  return (
    <Turnstile
      ref={turnstileInternalRef}
      siteKey={siteKey}
      onSuccess={handleSuccess}
      onError={handleError}
      onExpire={handleExpire}
      options={options}
    />
  );
});

TurnstileComponent.displayName = "TurnstileComponent"; 