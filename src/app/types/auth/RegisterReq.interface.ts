export interface RegisterReq {
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}
