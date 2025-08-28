const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const { requireAuth } = require('../middleware/auth');

// 待辦事項列表頁面
router.get('/', requireAuth, async (req, res) => {
  try {
    const todos = await Todo.findByUserId(req.session.userId);
    res.render('todos/index', { 
      title: '我的待辦事項',
      todos,
      user: req.session.user
    });
  } catch (error) {
    console.error('取得待辦事項錯誤:', error);
    res.status(500).render('error', { 
      message: '取得待辦事項失敗',
      error: error 
    });
  }
});

// 新增待辦事項頁面
router.get('/new', requireAuth, (req, res) => {
  res.render('todos/new', { 
    title: '新增待辦事項',
    user: req.session.user
  });
});

// 新增待辦事項處理
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || title.trim() === '') {
      return res.redirect('/todos/new?error=請輸入待辦事項標題');
    }
    
    await Todo.create(req.session.userId, title.trim(), description ? description.trim() : '');
    res.redirect('/todos');
  } catch (error) {
    console.error('新增待辦事項錯誤:', error);
    res.redirect('/todos/new?error=新增失敗，請稍後再試');
  }
});

// 查看待辦事項詳情
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).render('error', { 
        message: '待辦事項不存在',
        error: { status: 404 }
      });
    }
    
    if (todo.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).render('error', { 
        message: '沒有權限查看此待辦事項',
        error: { status: 403 }
      });
    }
    
    res.render('todos/show', { 
      title: '待辦事項詳情',
      todo,
      user: req.session.user
    });
  } catch (error) {
    console.error('取得待辦事項錯誤:', error);
    res.status(500).render('error', { 
      message: '取得待辦事項失敗',
      error: error 
    });
  }
});

// 編輯待辦事項頁面
router.get('/:id/edit', requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).render('error', { 
        message: '待辦事項不存在',
        error: { status: 404 }
      });
    }
    
    if (todo.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).render('error', { 
        message: '沒有權限編輯此待辦事項',
        error: { status: 403 }
      });
    }
    
    res.render('todos/edit', { 
      title: '編輯待辦事項',
      todo,
      user: req.session.user
    });
  } catch (error) {
    console.error('取得待辦事項錯誤:', error);
    res.status(500).render('error', { 
      message: '取得待辦事項失敗',
      error: error 
    });
  }
});

// 更新待辦事項
router.post('/:id', requireAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).render('error', { 
        message: '待辦事項不存在',
        error: { status: 404 }
      });
    }
    
    if (todo.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).render('error', { 
        message: '沒有權限編輯此待辦事項',
        error: { status: 403 }
      });
    }
    
    if (!title || title.trim() === '') {
      return res.redirect(`/todos/${req.params.id}/edit?error=請輸入待辦事項標題`);
    }
    
    await Todo.update(req.params.id, {
      title: title.trim(),
      description: description ? description.trim() : ''
    });
    
    res.redirect('/todos');
  } catch (error) {
    console.error('更新待辦事項錯誤:', error);
    res.redirect(`/todos/${req.params.id}/edit?error=更新失敗，請稍後再試`);
  }
});

// 切換完成狀態
router.patch('/:id/toggle', requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: '待辦事項不存在' });
    }
    
    if (todo.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: '沒有權限操作此待辦事項' });
    }
    
    await Todo.toggleComplete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('切換狀態錯誤:', error);
    res.status(500).json({ error: '操作失敗' });
  }
});

// 刪除待辦事項
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: '待辦事項不存在' });
    }
    
    if (todo.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: '沒有權限刪除此待辦事項' });
    }
    
    await Todo.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('刪除待辦事項錯誤:', error);
    res.status(500).json({ error: '刪除失敗' });
  }
});

module.exports = router;
