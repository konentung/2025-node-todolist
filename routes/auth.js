const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireGuest } = require('../middleware/auth');

// 登入頁面
router.get('/login', requireGuest, (req, res) => {
  res.render('auth/login', { 
    title: '登入',
    error: req.query.error 
  });
});

// 登入處理
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.redirect('/auth/login?error=請填寫所有欄位');
    }
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.redirect('/auth/login?error=帳號或密碼錯誤');
    }
    
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.redirect('/auth/login?error=帳號或密碼錯誤');
    }
    
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    res.redirect('/todos');
  } catch (error) {
    console.error('登入錯誤:', error);
    res.redirect('/auth/login?error=登入失敗，請稍後再試');
  }
});

// 註冊頁面
router.get('/register', requireGuest, (req, res) => {
  res.render('auth/register', { 
    title: '註冊',
    error: req.query.error 
  });
});

// 註冊處理
router.post('/register', requireGuest, async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (!username || !email || !password || !confirmPassword) {
      return res.redirect('/auth/register?error=請填寫所有欄位');
    }
    
    if (password !== confirmPassword) {
      return res.redirect('/auth/register?error=密碼確認不符');
    }
    
    if (password.length < 6) {
      return res.redirect('/auth/register?error=密碼至少需要6個字元');
    }
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.redirect('/auth/register?error=此電子郵件已被註冊');
    }
    
    const user = await User.create(username, email, password);
    
    req.session.userId = user._id;
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    res.redirect('/todos');
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.redirect('/auth/register?error=註冊失敗，請稍後再試');
  }
});

// 登出
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('登出錯誤:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
