document.addEventListener('DOMContentLoaded', function() {
  // 顯示錯誤 Toast 的函數
  function showErrorToast(message) {
    const toastElement = document.getElementById('errorToast');
    if (toastElement) {
      const toastBody = toastElement.querySelector('.toast-body');
      toastBody.textContent = message;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

  // 顯示成功 Toast 的函數
  function showSuccessToast(message) {
    const toastContainer = document.querySelector('.toast-container');
    const successToast = document.createElement('div');
    successToast.className = 'toast';
    successToast.setAttribute('role', 'alert');
    successToast.setAttribute('aria-live', 'assertive');
    successToast.setAttribute('aria-atomic', 'true');
    successToast.innerHTML = `
      <div class="toast-header bg-success text-white">
        <i class="bi bi-check-circle me-2"></i>
        <strong class="me-auto">成功</strong>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    toastContainer.appendChild(successToast);
    const toast = new bootstrap.Toast(successToast);
    toast.show();
    
    // 自動移除 toast 元素
    successToast.addEventListener('hidden.bs.toast', function() {
      toastContainer.removeChild(successToast);
    });
  }

  // 檢查 URL 參數中的錯誤訊息
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');
  if (error) {
    showErrorToast(decodeURIComponent(error));
    // 清除 URL 中的錯誤參數
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }

  // 切換完成狀態
  document.querySelectorAll('.toggle-complete').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const todoId = this.getAttribute('data-id');
      
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>處理中...';
      this.disabled = true;
      
      fetch(`/todos/${todoId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showSuccessToast('狀態更新成功！');
          setTimeout(() => location.reload(), 1000);
        } else {
          showErrorToast(data.error || '操作失敗，請稍後再試');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showErrorToast('操作失敗，請稍後再試');
      });
    });
  });

  // 刪除待辦事項
  document.querySelectorAll('.delete-todo').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const todoId = this.getAttribute('data-id');
      
      if (confirm('確定要刪除這個待辦事項嗎？此操作無法復原。')) {
        // 显示加载状态
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>處理中...';
        this.disabled = true;
        
        fetch(`/todos/${todoId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            showSuccessToast('刪除成功！');
            setTimeout(() => location.reload(), 1000);
          } else {
            showErrorToast(data.error || '刪除失敗，請稍後再試');
            // 恢复按钮状态
            this.innerHTML = originalText;
            this.disabled = false;
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showErrorToast('刪除失敗，請稍後再試');
          // 恢复按钮状态
          this.innerHTML = originalText;
          this.disabled = false;
        });
      }
    });
  });

  // 自動隱藏 Toast 訊息
  setTimeout(function() {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toastElement => {
      const toast = bootstrap.Toast.getInstance(toastElement);
      if (toast) {
        toast.hide();
      }
    });
  }, 5000);
});
