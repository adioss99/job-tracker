export default interface UserType {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN'| 'SUPER_ADMIN';
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}