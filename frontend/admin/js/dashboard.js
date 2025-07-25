// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!authManager.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    initializeDashboard();
});

// 初始化仪表板
async function initializeDashboard() {
    // 显示加载状态
    showLoading(true);

    try {
        // 并行加载数据
        await Promise.all([
            loadUserInfo(),
            loadDashboardStats(),
            loadRecentPosts(),
            loadCategoryStats()
        ]);

        // 初始化界面交互
        initializeUIInteractions();
        
        // 更新系统信息
        updateSystemInfo();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showNotification('仪表板加载失败', 'error');
    } finally {
        showLoading(false);
    }
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

// 加载仪表板统计数据
async function loadDashboardStats() {
    try {
        // 加载统计数据
        const statsResult = await authManager.request('/admin/dashboard/stats');
        if (statsResult && statsResult.code === 200) {
            const stats = statsResult.data;
            
            updateStatCard('totalPosts', stats.totalPosts || 0);
            updateStatCard('totalViews', stats.totalViews || 0);
            updateStatCard('totalCategories', stats.totalCategories || 0);
            updateStatCard('todayViews', stats.todayViews || 0);
        }
    } catch (error) {
        console.error('Load dashboard stats error:', error);
    }
}

// 更新统计卡片
function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // 数字动画效果
        animateNumber(element, 0, value, 1000);
    }
}

// 数字动画
function animateNumber(element, start, end, duration) {
    const startTime = Date.now();
    const difference = end - start;
    
    function updateNumber() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (difference * progress));
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    updateNumber();
}

// 加载最近文章
async function loadRecentPosts() {
    try {
        const result = await authManager.request('/admin/dashboard/recent-posts?limit=5');
        if (result && result.code === 200) {
            const posts = result.data;
            renderRecentPosts(Array.isArray(posts) ? posts : []);
        }
    } catch (error) {
        console.error('Load recent posts error:', error);
        renderRecentPosts([]);
    }
}

// 渲染最近文章
function renderRecentPosts(posts) {
    const container = document.getElementById('recentPosts');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>暂无文章</p>
            </div>
        `;
        return;
    }

    const html = posts.map(post => `
        <div class="post-item">
            <div class="post-meta">
                <div class="post-title">${escapeHtml(post.title)}</div>
                <div class="post-info">
                    <span><i class="fas fa-eye"></i> ${post.viewCount || 0}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(post.createTime)}</span>
                    <span class="post-status ${post.status === 1 ? 'published' : 'draft'}">
                        ${post.status === 1 ? '已发布' : '草稿'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// 加载分类统计
async function loadCategoryStats() {
    try {
        const result = await authManager.request('/admin/dashboard/stats');
        if (result && result.code === 200) {
            const categoryStats = result.data.categoryStats || {};
            renderCategoryStats(categoryStats);
        }
    } catch (error) {
        console.error('Load category stats error:', error);
        renderCategoryStats({});
    }
}

// 渲染分类统计
function renderCategoryStats(categoryStats) {
    const container = document.getElementById('categoryStats');
    
    const categories = Object.keys(categoryStats);
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder"></i>
                <p>暂无分类</p>
            </div>
        `;
        return;
    }

    const html = categories.map(categoryName => `
        <div class="category-item">
            <span class="category-name">${escapeHtml(categoryName)}</span>
            <span class="category-count">${categoryStats[categoryName]}</span>
        </div>
    `).join('');

    container.innerHTML = html;
}

// 更新系统信息
function updateSystemInfo() {
    // 更新运行时间（模拟）
    const startTime = new Date('2024-01-01').getTime();
    const now = new Date().getTime();
    const uptime = now - startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    
    const uptimeElement = document.getElementById('uptime');
    if (uptimeElement) {
        uptimeElement.textContent = `${days} 天`;
    }

    // 更新最后登录时间
    const lastLoginElement = document.getElementById('lastLogin');
    if (lastLoginElement) {
        const now = new Date();
        lastLoginElement.textContent = formatDateTime(now);
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

    // 点击外部关闭移动端侧边栏
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// 处理退出登录
async function handleLogout() {
    try {
        showLoading(true);
        await authManager.logout();
    } catch (error) {
        console.error('Logout error:', error);
        // 即使退出请求失败，也清除本地token
        authManager.clearToken();
        window.location.href = 'index.html';
    }
}

// 显示/隐藏加载状态
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
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

// 工具函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function formatDateTime(date) {
    if (!date) return '-';
    return date.toLocaleString('zh-CN');
}

// 响应式处理
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.remove('active');
    }
});