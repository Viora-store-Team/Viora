/**
 * Google Identity Services for Viora Customer Storefront
 */

export interface GoogleCredentialResponse {
  /** The Google ID token */
  credential: string;
  select_by?: string;
}

export interface GoogleButtonOptions {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with";
  shape?: "rectangular" | "pill";
  width?: number;
  locale?: string;
  logo_alignment?: "left" | "center";
}

export interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
  prompt?(momentListener?: (moment: unknown) => void): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
export const GOOGLE_ENABLED = GOOGLE_CLIENT_ID.length > 0;
export const GSI_SRC = "https://accounts.google.com/gsi/client";

export function getGoogleId(): GoogleIdApi | undefined {
  if (typeof window === "undefined") return undefined;
  return window.google?.accounts?.id;
}
