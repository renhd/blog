// 分类管理页面主脚本
let categories = [];
let filteredCategories = [];
let editingCategoryId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!authManager.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    initializeCategoriesPage();
});

// 初始化分类管理页面
async function initializeCategoriesPage() {
    try {
        // 初始化界面交互
        initializeUIInteractions();
        
        // 加载分类列表
        await loadCategories();
        
        // 加载用户信息
        await loadUserInfo();
    } catch (error) {
        console.error('Categories page initialization error:', error);
        showNotification('页面初始化失败', 'error');
    }
}

// 初始化界面交互
function initializeUIInteractions() {
    // 侧边栏切换
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });
    }

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // 恢复侧边栏状态
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }

    // 用户菜单切换
    const userInfo = document.getElementById('userInfo');
    const userDropdown = document.getElementById('userDropdown');

    if (userInfo && userDropdown) {
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            userInfo.parentElement.classList.toggle('active');
        });

        document.addEventListener('click', function() {
            userInfo.parentElement.classList.remove('active');
        });
    }

    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // 新建分类按钮
    const newCategoryBtn = document.getElementById('newCategoryBtn');
    if (newCategoryBtn) {
        newCategoryBtn.addEventListener('click', function() {
            openCategoryModal();
        });
    }

    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadCategories();
        });
    }

    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleSearch(this.value.trim());
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch(this.value.trim());
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchValue = searchInput.value.trim();
            handleSearch(searchValue);
        });
    }

    // 模态框事件
    initializeModalEvents();

    // 响应式处理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
}

// 加载用户信息
async function loadUserInfo() {
    try {
        const result = await authManager.getCurrentUser();
        if (result.success) {
            const user = result.data;
            document.querySelector('.user-name').textContent = user.nickname || user.username;
            
            if (user.avatar) {
                document.querySelector('.user-avatar').src = user.avatar;
            }
        }
    } catch (error) {
        console.error('Load user info error:', error);
    }
}

// 加载分类列表
async function loadCategories() {
    try {
        showLoading(true);

        const result = await authManager.request('/categories');
        
        if (result && result.code === 200) {
            categories = result.data.records || result.data || [];
            filteredCategories = [...categories];
            
            // 获取每个分类的文章数量
            await loadCategoryStats();
            
            renderCategories();
        } else {
            categories = [];
            filteredCategories = [];
            renderCategories();
        }
    } catch (error) {
        console.error('Load categories error:', error);
        categories = [];
        filteredCategories = [];
        renderCategories();
        showNotification('加载分类列表失败', 'error');
    } finally {
        showLoading(false);
    }
}

// 加载分类统计信息
async function loadCategoryStats() {
    try {
        const result = await authManager.request('/blog-posts');
        if (result && result.code === 200) {
            const posts = result.data.records || result.data || [];
            
            // 统计每个分类的文章数量
            categories.forEach(category => {
                const count = posts.filter(post => post.category === category.name).length;
                category.articleCount = count;
            });
        }
    } catch (error) {
        console.error('Load category stats error:', error);
        // 设置默认值
        categories.forEach(category => {
            category.articleCount = 0;
        });
    }
}

// 显示加载状态
function showLoading(show) {
    const grid = document.getElementById('categoriesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (show) {
        grid.innerHTML = `
            <div class="loading-card">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>加载中...</span>
                </div>
            </div>
        `;
        emptyState.style.display = 'none';
    }
}

// 渲染分类列表
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!filteredCategories || filteredCategories.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    const html = filteredCategories.map(category => `
        <div class="category-card" data-id="${category.id}">
            <div class="category-header">
                <div class="category-icon">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="category-actions">
                    <button class="action-btn edit" onclick="editCategory(${category.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteCategory(${category.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="category-content">
                <h3 class="category-name">${escapeHtml(category.name)}</h3>
                ${category.description ? `<p class="category-description">${escapeHtml(category.description)}</p>` : ''}
            </div>
            
            <div class="category-meta">
                <div class="category-stats">
                    <div class="stat-item">
                        <i class="fas fa-file-alt"></i>
                        <span>${category.articleCount || 0} 篇文章</span>
                    </div>
                </div>
                <div class="category-date">
                    ${formatDate(category.createTime)}
                </div>
            </div>
        </div>
    `).join('');

    grid.innerHTML = html;
}

// 处理搜索
function handleSearch(searchTerm) {
    if (!searchTerm) {
        filteredCategories = [...categories];
    } else {
        filteredCategories = categories.filter(category => 
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    renderCategories();
}

// 编辑分类
async function editCategory(id) {
    try {
        const result = await authManager.request(`/categories/${id}`);
        if (result && result.code === 200) {
            const category = result.data;
            editingCategoryId = id;
            openCategoryModal(category);
        } else {
            showNotification('获取分类信息失败', 'error');
        }
    } catch (error) {
        console.error('Load category error:', error);
        showNotification('获取分类信息失败', 'error');
    }
}

// 删除分类
function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) {
        showDeleteModal(category);
    }
}

// 处理退出登录
async function handleLogout() {
    try {
        await authManager.logout();
    } catch (error) {
        console.error('Logout error:', error);
        authManager.clearToken();
        window.location.href = 'index.html';
    }
}

// 模态框相关函数
function initializeModalEvents() {
    // 分类模态框
    const categoryModal = document.getElementById('categoryModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');

    // 关闭模态框事件
    [modalClose, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                closeCategoryModal();
            });
        }
    });

    // 点击遮罩关闭
    categoryModal.addEventListener('click', function(e) {
        if (e.target === categoryModal) {
            closeCategoryModal();
        }
    });

    // 保存分类
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveCategory();
        });
    }

    // 删除确认模态框
    const deleteModal = document.getElementById('deleteModal');
    const deleteModalClose = document.getElementById('deleteModalClose');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    [deleteModalClose, cancelDeleteBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                closeDeleteModal();
            });
        }
    });

    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            confirmDelete();
        });
    }
}

// 打开分类模态框
function openCategoryModal(category = null) {
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('categoryForm');
    
    // 重置表单
    form.reset();
    
    if (category) {
        // 编辑模式
        modalTitle.textContent = '编辑分类';
        
        // 填充表单数据
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryDescription').value = category.description || '';
        
        editingCategoryId = category.id;
    } else {
        // 新建模式
        modalTitle.textContent = '新建分类';
        editingCategoryId = null;
    }
    
    // 显示模态框
    modal.classList.add('active');
    
    // 聚焦名称输入框
    setTimeout(() => {
        document.getElementById('categoryName').focus();
    }, 100);
}

// 关闭分类模态框
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('active');
    editingCategoryId = null;
}

// 保存分类
async function saveCategory() {
    const form = document.getElementById('categoryForm');
    const formData = new FormData(form);
    
    // 验证必填字段
    const name = formData.get('name').trim();
    
    if (!name) {
        showNotification('请输入分类名称', 'error');
        return;
    }
    
    // 检查分类名称是否重复
    const existingCategory = categories.find(c => 
        c.name.toLowerCase() === name.toLowerCase() && c.id !== editingCategoryId
    );
    
    if (existingCategory) {
        showNotification('分类名称已存在', 'error');
        return;
    }
    
    // 构建分类数据
    const categoryData = {
        name: name,
        description: formData.get('description').trim()
    };
    
    try {
        let result;
        
        if (editingCategoryId) {
            // 更新分类
            categoryData.id = editingCategoryId;
            result = await authManager.request(`/categories/${editingCategoryId}`, {
                method: 'PUT',
                body: JSON.stringify(categoryData)
            });
        } else {
            // 创建新分类
            result = await authManager.request('/categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
        }
        
        if (result && result.code === 200) {
            const action = editingCategoryId ? '更新' : '创建';
            showNotification(`${action}分类成功`, 'success');
            
            closeCategoryModal();
            loadCategories(); // 刷新分类列表
        } else {
            showNotification(result?.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('Save category error:', error);
        showNotification('保存失败，请稍后重试', 'error');
    }
}

// 显示删除确认模态框
function showDeleteModal(category) {
    const modal = document.getElementById('deleteModal');
    const categoryNameSpan = document.getElementById('deleteCategoryName');
    
    categoryNameSpan.textContent = category.name;
    modal.dataset.categoryId = category.id;
    modal.classList.add('active');
}

// 关闭删除确认模态框
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
    delete modal.dataset.categoryId;
}

// 确认删除
async function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    const categoryId = parseInt(modal.dataset.categoryId);
    
    try {
        const result = await authManager.request(`/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (result && result.code === 200) {
            showNotification('删除分类成功', 'success');
            closeDeleteModal();
            loadCategories(); // 刷新分类列表
        } else {
            showNotification(result?.message || '删除失败', 'error');
        }
    } catch (error) {
        console.error('Delete category error:', error);
        showNotification('删除失败，请稍后重试', 'error');
    }
}

// 工具函数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-left: 4px solid var(--${type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'}-color);
        border-radius: var(--radius);
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 添加关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });

    // 自动关闭
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 5000);
}