const { getDB } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, email, password) {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    const result = await db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }
  
  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }
  
  static async findById(id) {
    const db = getDB();
    return await db.collection('users').findOne({ _id: id });
  }
  
  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
