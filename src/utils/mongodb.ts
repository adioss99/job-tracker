import { MongoClient, type Db, type Collection } from 'mongodb';

const client = new MongoClient(process.env.DATABASE_URL!);

let db: Db | null = null;

export async function mongodb(table: string) {
  if (!db) {
    await client.connect(); 
    db = client.db('job');
  }
  const collection = db.collection(table);
  return collection;
}

export default {mongodb, client};
