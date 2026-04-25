export interface UserRes {
  name: string;
  email: string;
  birthDate: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}
