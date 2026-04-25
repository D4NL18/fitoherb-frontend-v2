export interface RegisterReq {
  email: string;
  name: string;
  birthDate: string;
  role: 'ADMIN' | 'USER';
}
