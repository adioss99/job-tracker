export default interface StatusType {
  id: string;
  jobId: string; // Assuming jobId is a string representing the Job's ID
  status: string;
  addDate?: Date; // Optional field for the date when the status was added
  createdAt?: Date; // Optional field for creation timestamp
  updatedAt?: Date; // Optional field for last update timestamp
}