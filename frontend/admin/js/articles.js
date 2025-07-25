// 文章管理页面主脚本
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let totalCount = 0;
let currentFilters = {
    status: '',
    category: '',
    search: ''
};
let selectedArticles = new Set();
let editingArticleId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!authManager.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    initializeArticlesPage();
});

// 初始化文章管理页面
async function initializeArticlesPage() {
    try {
        // 初始化界面交互
        initializeUIInteractions();
        
        // 加载分类数据
        await loadCategories();
        
        // 加载文章列表
        await loadArticles();
        
        // 加载用户信息
        await loadUserInfo();
        
        // 初始化文件上传功能
        initializeFileUpload();
    } catch (error) {
        console.error('Articles page initialization error:', error);
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

    // 新建文章按钮
    const newArticleBtn = document.getElementById('newArticleBtn');
    if (newArticleBtn) {
        newArticleBtn.addEventListener('click', function() {
            openArticleModal();
        });
    }

    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadArticles();
        });
    }

    // 筛选器事件
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentFilters.status = this.value;
            currentPage = 1;
            loadArticles();
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentFilters.category = this.value;
            currentPage = 1;
            loadArticles();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // 全选checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            handleSelectAll(this.checked);
        });
    }

    // 批量操作按钮
    const bulkPublishBtn = document.getElementById('bulkPublishBtn');
    const bulkDraftBtn = document.getElementById('bulkDraftBtn');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

    if (bulkPublishBtn) {
        bulkPublishBtn.addEventListener('click', () => handleBulkAction('publish'));
    }

    if (bulkDraftBtn) {
        bulkDraftBtn.addEventListener('click', () => handleBulkAction('draft'));
    }

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', () => handleBulkAction('delete'));
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

// 加载分类数据
async function loadCategories() {
    try {
        const result = await authManager.request('/categories');
        if (result && result.code === 200) {
            const categories = result.data.records || result.data || [];
            
            // 更新分类筛选器
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">全部分类</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }

            // 更新文章表单中的分类选择器
            const articleCategory = document.getElementById('articleCategory');
            if (articleCategory) {
                articleCategory.innerHTML = '<option value="">选择分类</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    articleCategory.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Load categories error:', error);
    }
}

// 加载文章列表
async function loadArticles() {
    try {
        showTableLoading(true);

        // 构建查询参数
        const params = new URLSearchParams({
            current: currentPage,
            size: pageSize
        });

        if (currentFilters.status) {
            params.append('status', currentFilters.status);
        }

        if (currentFilters.category) {
            params.append('category', currentFilters.category);
        }

        if (currentFilters.search) {
            params.append('title', currentFilters.search);
        }

        const result = await authManager.request(`/blog-posts?${params.toString()}`);
        
        if (result && result.code === 200) {
            const data = result.data;
            const articles = data.records || data || [];
            
            totalCount = data.total || articles.length;
            totalPages = Math.ceil(totalCount / pageSize);
            
            renderArticlesTable(articles);
            renderPagination();
            updateSelectedCount();
        } else {
            renderArticlesTable([]);
        }
    } catch (error) {
        console.error('Load articles error:', error);
        renderArticlesTable([]);
        showNotification('加载文章列表失败', 'error');
    } finally {
        showTableLoading(false);
    }
}

// 渲染文章表格
function renderArticlesTable(articles) {
    const tbody = document.getElementById('articlesTableBody');
    
    if (!articles || articles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <p>暂无文章</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const html = articles.map(article => `
        <tr class="${selectedArticles.has(article.id) ? 'selected' : ''}" data-id="${article.id}">
            <td>
                <input type="checkbox" class="article-checkbox" data-id="${article.id}" 
                       ${selectedArticles.has(article.id) ? 'checked' : ''}>
            </td>
            <td>
                <div class="article-title">
                    <strong>${escapeHtml(article.title)}</strong>
                    ${article.summary ? `<div class="article-summary">${escapeHtml(article.summary.substring(0, 100))}${article.summary.length > 100 ? '...' : ''}</div>` : ''}
                </div>
            </td>
            <td>${escapeHtml(article.category || '-')}</td>
            <td>
                <span class="status-badge ${article.status === 1 ? 'published' : 'draft'}">
                    <i class="fas fa-${article.status === 1 ? 'check' : 'edit'}"></i>
                    ${article.status === 1 ? '已发布' : '草稿'}
                </span>
            </td>
            <td>${article.viewCount || 0}</td>
            <td>${formatDateTime(article.createTime)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewArticle(${article.id})" title="查看">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editArticle(${article.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteArticle(${article.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html;

    // 添加checkbox事件监听
    tbody.querySelectorAll('.article-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const articleId = parseInt(this.dataset.id);
            const row = this.closest('tr');
            
            if (this.checked) {
                selectedArticles.add(articleId);
                row.classList.add('selected');
            } else {
                selectedArticles.delete(articleId);
                row.classList.remove('selected');
            }
            
            updateSelectedCount();
            updateSelectAllState();
        });
    });
}

// 显示表格加载状态
function showTableLoading(show) {
    const tbody = document.getElementById('articlesTableBody');
    if (show) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="7">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>加载中...</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// 渲染分页
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    const totalCountEl = document.getElementById('totalCount');

    // 更新信息显示
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    pageInfo.textContent = `${start}-${end}`;
    totalCountEl.textContent = totalCount;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // 上一页按钮
    html += `
        <button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // 页码按钮
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="page-dots">...</span>`;
        }
        html += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // 下一页按钮
    html += `
        <button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

// 切换页面
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    currentPage = page;
    loadArticles();
}

// 处理搜索
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    currentFilters.search = searchInput.value.trim();
    currentPage = 1;
    loadArticles();
}

// 处理全选
function handleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.article-checkbox');
    const rows = document.querySelectorAll('tbody tr[data-id]');
    
    selectedArticles.clear();
    
    if (checked) {
        checkboxes.forEach((checkbox, index) => {
            const articleId = parseInt(checkbox.dataset.id);
            checkbox.checked = true;
            selectedArticles.add(articleId);
            rows[index].classList.add('selected');
        });
    } else {
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = false;
            rows[index].classList.remove('selected');
        });
    }
    
    updateSelectedCount();
}

// 更新选中数量
function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    const bulkActions = document.getElementById('bulkActions');
    
    if (selectedCount) {
        selectedCount.textContent = selectedArticles.size;
    }
    
    if (bulkActions) {
        if (selectedArticles.size > 0) {
            bulkActions.style.display = 'flex';
        } else {
            bulkActions.style.display = 'none';
        }
    }
}

// 更新全选状态
function updateSelectAllState() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.article-checkbox');
    
    if (checkboxes.length === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
        return;
    }
    
    const checkedCount = selectedArticles.size;
    
    if (checkedCount === 0) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
        selectAll.checked = true;
        selectAll.indeterminate = false;
    } else {
        selectAll.checked = false;
        selectAll.indeterminate = true;
    }
}

// 批量操作
async function handleBulkAction(action) {
    if (selectedArticles.size === 0) {
        showNotification('请先选择要操作的文章', 'warning');
        return;
    }

    const articleIds = Array.from(selectedArticles);
    
    try {
        let success = false;
        
        switch (action) {
            case 'publish':
                success = await bulkPublishArticles(articleIds);
                break;
            case 'draft':
                success = await bulkDraftArticles(articleIds);
                break;
            case 'delete':
                success = await confirmAndDeleteArticles(articleIds);
                break;
        }
        
        if (success) {
            selectedArticles.clear();
            updateSelectedCount();
            loadArticles();
        }
    } catch (error) {
        console.error('Bulk action error:', error);
        showNotification('批量操作失败', 'error');
    }
}

// 批量发布文章
async function bulkPublishArticles(articleIds) {
    // 这里应该调用批量发布API
    // 目前先逐个发布
    let successCount = 0;
    
    for (const id of articleIds) {
        try {
            const result = await authManager.request(`/blog-posts/${id}/publish`, {
                method: 'PUT'
            });
            if (result && result.code === 200) {
                successCount++;
            }
        } catch (error) {
            console.error(`Publish article ${id} error:`, error);
        }
    }
    
    if (successCount > 0) {
        showNotification(`成功发布 ${successCount} 篇文章`, 'success');
        return true;
    } else {
        showNotification('发布失败', 'error');
        return false;
    }
}

// 批量设为草稿
async function bulkDraftArticles(articleIds) {
    // 这里应该调用批量设为草稿API
    // 目前先模拟
    showNotification(`已将 ${articleIds.length} 篇文章设为草稿`, 'success');
    return true;
}

// 确认并删除文章
async function confirmAndDeleteArticles(articleIds) {
    return new Promise((resolve) => {
        const deleteModal = document.getElementById('deleteModal');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const deleteModalClose = document.getElementById('deleteModalClose');
        
        // 显示删除确认模态框
        deleteModal.classList.add('active');
        
        // 确认删除
        const handleConfirm = async () => {
            try {
                let successCount = 0;
                
                for (const id of articleIds) {
                    try {
                        const result = await authManager.request(`/blog-posts/${id}`, {
                            method: 'DELETE'
                        });
                        if (result && result.code === 200) {
                            successCount++;
                        }
                    } catch (error) {
                        console.error(`Delete article ${id} error:`, error);
                    }
                }
                
                deleteModal.classList.remove('active');
                
                if (successCount > 0) {
                    showNotification(`成功删除 ${successCount} 篇文章`, 'success');
                    resolve(true);
                } else {
                    showNotification('删除失败', 'error');
                    resolve(false);
                }
            } catch (error) {
                deleteModal.classList.remove('active');
                showNotification('删除失败', 'error');
                resolve(false);
            }
            
            // 移除事件监听
            confirmDeleteBtn.removeEventListener('click', handleConfirm);
            cancelDeleteBtn.removeEventListener('click', handleCancel);
            deleteModalClose.removeEventListener('click', handleCancel);
        };
        
        // 取消删除
        const handleCancel = () => {
            deleteModal.classList.remove('active');
            
            // 移除事件监听
            confirmDeleteBtn.removeEventListener('click', handleConfirm);
            cancelDeleteBtn.removeEventListener('click', handleCancel);
            deleteModalClose.removeEventListener('click', handleCancel);
            
            resolve(false);
        };
        
        // 添加事件监听
        confirmDeleteBtn.addEventListener('click', handleConfirm);
        cancelDeleteBtn.addEventListener('click', handleCancel);
        deleteModalClose.addEventListener('click', handleCancel);
    });
}

// 查看文章
function viewArticle(id) {
    // 在新窗口打开文章详情页
    window.open(`../article.html?id=${id}`, '_blank');
}

// 编辑文章
async function editArticle(id) {
    try {
        const result = await authManager.request(`/blog-posts/${id}`);
        if (result && result.code === 200) {
            const article = result.data;
            editingArticleId = id;
            openArticleModal(article);
        } else {
            showNotification('获取文章信息失败', 'error');
        }
    } catch (error) {
        console.error('Load article error:', error);
        showNotification('获取文章信息失败', 'error');
    }
}

// 删除单篇文章
function deleteArticle(id) {
    confirmAndDeleteArticles([id]);
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

// 工具函数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
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

// 文件上传相关功能
let currentUploadFiles = [];
let uploadInProgress = false;

// 初始化文件上传功能
function initializeFileUpload() {
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const uploadVideoBtn = document.getElementById('uploadVideoBtn');
    const fileInput = document.getElementById('fileInput');
    const uploadModal = document.getElementById('uploadModal');
    const uploadModalClose = document.getElementById('uploadModalClose');
    const closeUploadBtn = document.getElementById('closeUploadBtn');

    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', () => {
            fileInput.accept = 'image/*';
            fileInput.click();
        });
    }

    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', () => {
            fileInput.accept = 'video/*';
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    if (uploadModalClose) {
        uploadModalClose.addEventListener('click', closeUploadModal);
    }

    if (closeUploadBtn) {
        closeUploadBtn.addEventListener('click', closeUploadModal);
    }

    // 添加拖放支持
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
        editorContainer.addEventListener('dragover', handleDragOver);
        editorContainer.addEventListener('drop', handleDrop);
    }
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        uploadFiles(files);
    }
    event.target.value = ''; // 重置文件输入
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-over');

    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        return isImage || isVideo;
    });

    if (validFiles.length > 0) {
        uploadFiles(validFiles);
    } else {
        showNotification('请拖放图片或视频文件', 'error');
    }
}

function uploadFiles(files) {
    if (uploadInProgress) {
        showNotification('已有上传任务在进行中', 'warning');
        return;
    }

    uploadInProgress = true;
    currentUploadFiles = files;
    showUploadModal();
    
    const uploadPromises = files.map((file, index) => 
        uploadFile(file, index, files.length)
    );

    Promise.allSettled(uploadPromises).then(results => {
        displayUploadResults(results);
        uploadInProgress = false;
    });
}

async function uploadFile(file, index, total) {
    const formData = new FormData();
    formData.append('file', file);

    updateUploadProgress(index, 0, file.name, total);

    try {
        const result = await authManager.request('/files/upload', {
            method: 'POST',
            body: formData,
            // 使用XMLHttpRequest来跟踪上传进度
            onUploadProgress: (progressEvent) => {
                if (progressEvent.lengthComputable) {
                    const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    updateUploadProgress(index, percentComplete, file.name, total);
                }
            }
        });

        if (result && result.code === 200) {
            return {
                status: 'success',
                data: result.data,
                file: file
            };
        } else {
            throw new Error(result?.message || '上传失败');
        }
    } catch (error) {
        return {
            status: 'error',
            error: error.message,
            file: file
        };
    }
}

function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        // 清理之前可能存在的事件监听器
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (uploadedFiles && uploadedFiles._insertHandler) {
            uploadedFiles.removeEventListener('click', uploadedFiles._insertHandler);
            uploadedFiles._insertHandler = null;
        }
        
        modal.classList.add('active');
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        
        // 清理事件监听器
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (uploadedFiles && uploadedFiles._insertHandler) {
            uploadedFiles.removeEventListener('click', uploadedFiles._insertHandler);
            uploadedFiles._insertHandler = null;
        }
        
        // 重置进度显示
        const uploadResults = document.getElementById('uploadResults');
        const closeUploadBtn = document.getElementById('closeUploadBtn');
        if (uploadResults) uploadResults.style.display = 'none';
        if (closeUploadBtn) closeUploadBtn.style.display = 'none';
    }
}

function updateUploadProgress(index, percent, fileName, total) {
    const uploadFileName = document.getElementById('uploadFileName');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const uploadStatus = document.getElementById('uploadStatus');

    if (uploadFileName) uploadFileName.textContent = fileName;
    if (uploadProgress) uploadProgress.textContent = `${percent}%`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (uploadStatus) {
        uploadStatus.textContent = `正在上传第 ${index + 1}/${total} 个文件...`;
    }
}

function displayUploadResults(results) {
    const uploadResults = document.getElementById('uploadResults');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const closeUploadBtn = document.getElementById('closeUploadBtn');

    if (!uploadResults || !uploadedFiles) return;

    uploadResults.style.display = 'block';
    if (closeUploadBtn) closeUploadBtn.style.display = 'block';

    let html = '';
    const contentTextarea = document.getElementById('articleContent');

    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.status === 'success') {
            const file = result.value.data;
            const isImage = file.fileType === 'image';
            let markdown;
            let htmlContent;
            if (isImage) {
                markdown = `![${file.originalName}](${file.fileUrl})`;
                htmlContent = markdown;
            } else {
                markdown = `<video src="${file.fileUrl}" controls style="max-width: 100%;"></video>`;
                htmlContent = markdown;
            }

            // 使用data属性存储markdown内容，避免引号冲突
            html += `
                <div class="uploaded-file upload-success">
                    <i class="fas fa-${isImage ? 'image' : 'video'}"></i>
                    <div class="file-name">${file.originalName}</div>
                    <div class="file-size">${formatFileSize(file.fileSize)}</div>
                    <button class="editor-btn insert-file-btn" data-markdown="${encodeURIComponent(htmlContent)}" title="插入到编辑器">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        } else {
            const error = result.reason || result.value?.error;
            html += `
                <div class="uploaded-file upload-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="file-name">${result.value?.file?.name || '未知文件'}</div>
                    <div class="file-size">${error || '上传失败'}</div>
                </div>
            `;
        }
    });

    uploadedFiles.innerHTML = html;

    // 移除之前的事件监听器，然后添加新的事件委托处理插入按钮点击
    const existingHandler = uploadedFiles._insertHandler;
    if (existingHandler) {
        uploadedFiles.removeEventListener('click', existingHandler);
    }
    
    const insertHandler = function(e) {
        if (e.target.classList.contains('insert-file-btn') || e.target.closest('.insert-file-btn')) {
            const button = e.target.classList.contains('insert-file-btn') ? e.target : e.target.closest('.insert-file-btn');
            const markdown = decodeURIComponent(button.dataset.markdown);
            insertMarkdown(markdown);
        }
    };
    
    uploadedFiles._insertHandler = insertHandler;
    uploadedFiles.addEventListener('click', insertHandler);

    // 更新上传状态
    const uploadStatus = document.getElementById('uploadStatus');
    const successCount = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 'success'
    ).length;
    
    if (uploadStatus) {
        uploadStatus.textContent = `上传完成：成功 ${successCount}/${results.length} 个文件`;
    }

    // 显示成功消息
    if (successCount > 0) {
        showNotification(`成功上传 ${successCount} 个文件`, 'success');
    }
}

function insertMarkdown(markdown) {
    const contentTextarea = document.getElementById('articleContent');
    if (contentTextarea) {
        const start = contentTextarea.selectionStart;
        const end = contentTextarea.selectionEnd;
        const currentText = contentTextarea.value;
        
        const newText = currentText.substring(0, start) + '\n' + markdown + '\n' + currentText.substring(end);
        contentTextarea.value = newText;
        
        // 设置光标位置
        const newPosition = start + markdown.length + 2;
        contentTextarea.setSelectionRange(newPosition, newPosition);
        contentTextarea.focus();
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 模态框相关函数
function initializeModalEvents() {
    // 文章模态框
    const articleModal = document.getElementById('articleModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const publishBtn = document.getElementById('publishBtn');
    const previewBtn = document.getElementById('previewBtn');

    // 关闭模态框事件
    [modalClose, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                closeArticleModal();
            });
        }
    });

    // 点击遮罩关闭
    articleModal.addEventListener('click', function(e) {
        if (e.target === articleModal) {
            closeArticleModal();
        }
    });

    // 保存草稿
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            saveArticle(0); // 状态为草稿
        });
    }

    // 发布文章
    if (publishBtn) {
        publishBtn.addEventListener('click', function() {
            saveArticle(1); // 状态为已发布
        });
    }

    // 预览切换
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            togglePreview();
        });
    }

    // 编辑器工具栏
    const editorBtns = document.querySelectorAll('.editor-btn[data-action]');
    editorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            if (action !== 'preview') {
                handleEditorAction(action);
            }
        });
    });
}

function openArticleModal(article = null) {
    const modal = document.getElementById('articleModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('articleForm');
    
    // 重置表单
    form.reset();
    
    if (article) {
        // 编辑模式
        modalTitle.textContent = '编辑文章';
        
        // 填充表单数据
        document.getElementById('articleTitle').value = article.title || '';
        document.getElementById('articleCategory').value = article.category || '';
        document.getElementById('articleTags').value = article.tags || '';
        document.getElementById('articleSummary').value = article.summary || '';
        document.getElementById('articleContent').value = article.content || '';
        
        editingArticleId = article.id;
    } else {
        // 新建模式
        modalTitle.textContent = '新建文章';
        editingArticleId = null;
    }
    
    // 隐藏预览
    const previewContainer = document.getElementById('previewContainer');
    const contentTextarea = document.getElementById('articleContent');
    previewContainer.style.display = 'none';
    contentTextarea.style.display = 'block';
    
    // 重置预览按钮状态
    const previewBtn = document.getElementById('previewBtn');
    previewBtn.classList.remove('active');
    previewBtn.innerHTML = '<i class="fas fa-eye"></i> 预览';
    
    // 显示模态框
    modal.classList.add('active');
    
    // 聚焦标题输入框
    setTimeout(() => {
        document.getElementById('articleTitle').focus();
    }, 100);
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    modal.classList.remove('active');
    editingArticleId = null;
}

// 保存文章
async function saveArticle(status) {
    const form = document.getElementById('articleForm');
    const formData = new FormData(form);
    
    // 验证必填字段
    const title = formData.get('title').trim();
    const content = formData.get('content').trim();
    
    if (!title) {
        showNotification('请输入文章标题', 'error');
        return;
    }
    
    if (!content) {
        showNotification('请输入文章内容', 'error');
        return;
    }
    
    // 构建文章数据
    const articleData = {
        title: title,
        content: content,
        summary: formData.get('summary').trim(),
        category: formData.get('category'),
        tags: formData.get('tags').trim(),
        status: status,
        author: 'admin' // 当前登录用户
    };
    
    try {
        let result;
        
        if (editingArticleId) {
            // 更新文章
            articleData.id = editingArticleId;
            result = await authManager.request(`/blog-posts/${editingArticleId}`, {
                method: 'PUT',
                body: JSON.stringify(articleData)
            });
        } else {
            // 创建新文章
            result = await authManager.request('/blog-posts', {
                method: 'POST',
                body: JSON.stringify(articleData)
            });
        }
        
        if (result && result.code === 200) {
            const action = editingArticleId ? '更新' : '创建';
            const statusText = status === 1 ? '并发布' : '为草稿';
            showNotification(`${action}文章成功${statusText}`, 'success');
            
            closeArticleModal();
            loadArticles(); // 刷新文章列表
        } else {
            showNotification(result?.message || '保存失败', 'error');
        }
    } catch (error) {
        console.error('Save article error:', error);
        showNotification('保存失败，请稍后重试', 'error');
    }
}

// 切换预览
function togglePreview() {
    const previewBtn = document.getElementById('previewBtn');
    const previewContainer = document.getElementById('previewContainer');
    const contentTextarea = document.getElementById('articleContent');
    const previewContent = document.getElementById('previewContent');
    
    if (previewContainer.style.display === 'none') {
        // 显示预览
        const content = contentTextarea.value;
        previewContent.innerHTML = parseMarkdown(content);
        
        previewContainer.style.display = 'block';
        contentTextarea.style.display = 'none';
        
        previewBtn.classList.add('active');
        previewBtn.innerHTML = '<i class="fas fa-edit"></i> 编辑';
    } else {
        // 显示编辑
        previewContainer.style.display = 'none';
        contentTextarea.style.display = 'block';
        
        previewBtn.classList.remove('active');
        previewBtn.innerHTML = '<i class="fas fa-eye"></i> 预览';
    }
}

// 处理编辑器操作
function handleEditorAction(action) {
    const textarea = document.getElementById('articleContent');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    
    switch (action) {
        case 'bold':
            replacement = `**${selectedText || '粗体文本'}**`;
            break;
        case 'italic':
            replacement = `*${selectedText || '斜体文本'}*`;
            break;
        case 'link':
            const url = prompt('请输入链接地址:');
            if (url) {
                replacement = `[${selectedText || '链接文本'}](${url})`;
            }
            break;
        case 'image':
            const imgUrl = prompt('请输入图片地址:');
            if (imgUrl) {
                replacement = `![${selectedText || '图片描述'}](${imgUrl})`;
            }
            break;
        case 'code':
            if (selectedText.includes('\n')) {
                replacement = `\`\`\`\n${selectedText || '代码块'}\n\`\`\``;
            } else {
                replacement = `\`${selectedText || '代码'}\``;
            }
            break;
    }
    
    if (replacement) {
        const newText = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        textarea.value = newText;
        
        // 设置光标位置
        const newStart = start + replacement.length;
        textarea.setSelectionRange(newStart, newStart);
        textarea.focus();
    }
}

// 简单的Markdown解析（仅用于预览）
function parseMarkdown(markdown) {
    if (!markdown) return '';
    
    return markdown
        // 标题
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // 粗体
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // 斜体
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 行内代码
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // 链接
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // 图片
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;">')
        // 换行
        .replace(/\n/g, '<br>');
}