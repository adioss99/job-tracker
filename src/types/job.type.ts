export default interface JobType {
  id: string;
  title: string;
  company: string;
  role: string;
  type: string;
  source: string;
  sourceLink?: string;
  location: string;
  applyDate: Date;
  applyOn: string;
  userId: string; // Assuming userId is a string representing the user's ID
  createdAt?: Date;
  updatedAt?: Date;
}