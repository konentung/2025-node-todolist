const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

class Todo {
  static async create(userId, title, description = '') {
    const db = getDB();
    
    const todo = {
      userId,
      title,
      description,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('todos').insertOne(todo);
    return { ...todo, _id: result.insertedId };
  }
  
  static async findByUserId(userId) {
    const db = getDB();
    return await db.collection('todos').find({ userId }).sort({ createdAt: -1 }).toArray();
  }
  
  static async findById(id) {
    const db = getDB();
    try {
      // 清理 ID，移除可能的引号和空格
      const cleanId = id.toString().replace(/['"]/g, '').trim();
      return await db.collection('todos').findOne({ _id: new ObjectId(cleanId) });
    } catch (error) {
      console.error('Invalid ObjectId:', id, error);
      return null;
    }
  }
  
  static async update(id, updates) {
    const db = getDB();
    try {
      const cleanId = id.toString().replace(/['"]/g, '').trim();
      const updateData = { ...updates, updatedAt: new Date() };
      
      const result = await db.collection('todos').updateOne(
        { _id: new ObjectId(cleanId) },
        { $set: updateData }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Invalid ObjectId for update:', id, error);
      return false;
    }
  }
  
  static async delete(id) {
    const db = getDB();
    try {
      const cleanId = id.toString().replace(/['"]/g, '').trim();
      const result = await db.collection('todos').deleteOne({ _id: new ObjectId(cleanId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Invalid ObjectId for delete:', id, error);
      return false;
    }
  }
  
  static async toggleComplete(id) {
    const db = getDB();
    try {
      const cleanId = id.toString().replace(/['"]/g, '').trim();
      const todo = await this.findById(cleanId);
      if (!todo) return false;
      
      const result = await db.collection('todos').updateOne(
        { _id: new ObjectId(cleanId) },
        { 
          $set: { 
            completed: !todo.completed,
            updatedAt: new Date()
          } 
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Invalid ObjectId for toggle:', id, error);
      return false;
    }
  }
}

module.exports = Todo;
