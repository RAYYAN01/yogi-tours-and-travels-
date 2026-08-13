export interface EnquiryApiSuccess {
  success: true;
  id: number;
  whatsappUrl: string;
  message: string;
}

export interface EnquiryApiFailure {
  success: false;
  message?: string;
  errors?: Record<string, string>;
}

export type EnquiryApiResponse = EnquiryApiSuccess | EnquiryApiFailure;

export type FormState = "idle" | "success" | "error";
