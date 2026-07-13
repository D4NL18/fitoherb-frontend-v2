export interface UserRes {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}
