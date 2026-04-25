export interface AuthError {
  status: number;
  message: string;
  errors?: { [key: string]: string };
}
