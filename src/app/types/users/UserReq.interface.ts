export interface UserReq {
  name: string;
  birthDate: string;
  role: 'ADMIN' | 'USER';
}
