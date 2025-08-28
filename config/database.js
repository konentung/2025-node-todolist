const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = 'todolist';

let db = null;
let client = null;

async function connectDB() {
  try {
    const options = uri.includes('mongodb+srv') ? {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    } : {};

    client = new MongoClient(uri, options);
    await client.connect();
    
    await client.db("admin").command({ ping: 1 });
    
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('MongoDB 連接失敗:', error);
    console.log('   1. 確認 .env 檔案存在且包含正確的 MONGODB_URI');
    console.log('   2. 確認 MongoDB Atlas 連接字串正確');
    console.log('   3. 確認網路連接正常');
    console.log('   4. 確認 IP 白名單設定');
    console.log('   5. 確認使用者名稱和密碼正確');
    return db;
  }
}

function getDB() {
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
  }
}

module.exports = { connectDB, getDB, closeDB };
