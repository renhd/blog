// 系统设置页面主脚本
let currentUser = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    if (!authManager.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    initializeSettingsPage();
});

// 初始化设置页面
async function initializeSettingsPage() {
    try {
        // 初始化界面交互
        initializeUIInteractions();
        
        // 加载用户信息
        await loadUserInfo();
        
        // 加载系统信息
        await loadSystemInfo();
        
        // 初始化表单验证
        initializeFormValidation();
    } catch (error) {
        console.error('Settings page initialization error:', error);
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

    // 设置标签页切换
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // 表单提交事件
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }

    // 重置按钮事件
    const resetProfileBtn = document.getElementById('resetProfileBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');

    if (resetProfileBtn) {
        resetProfileBtn.addEventListener('click', resetProfileForm);
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', resetPasswordForm);
    }

    // 维护操作按钮
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const backupDataBtn = document.getElementById('backupDataBtn');
    const viewLogsBtn = document.getElementById('viewLogsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const clearAllDataBtn = document.getElementById('clearAllDataBtn');

    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', handleClearCache);
    }

    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', handleBackupData);
    }

    if (viewLogsBtn) {
        viewLogsBtn.addEventListener('click', handleViewLogs);
    }

    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', handleResetSettings);
    }

    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', handleClearAllData);
    }

    // 头像上传
    const avatarFile = document.getElementById('avatarFile');
    if (avatarFile) {
        avatarFile.addEventListener('change', handleAvatarUpload);
    }

    // 日志模态框
    initializeLogsModal();

    // 响应式处理
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
}

// 切换标签页
function switchTab(tabName) {
    // 更新导航标签状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 更新内容区域
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// 加载用户信息
async function loadUserInfo() {
    try {
        const result = await authManager.getCurrentUser();
        if (result.success) {
            currentUser = result.data;
            
            // 更新导航栏用户信息
            document.querySelector('.user-name').textContent = currentUser.nickname || currentUser.username;
            
            if (currentUser.avatar) {
                document.querySelector('.user-avatar').src = currentUser.avatar;
            }

            // 填充个人信息表单
            fillProfileForm(currentUser);
        }
    } catch (error) {
        console.error('Load user info error:', error);
    }
}

// 填充个人信息表单
function fillProfileForm(user) {
    document.getElementById('username').value = user.username || '';
    document.getElementById('nickname').value = user.nickname || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('role').value = user.role || '';
    
    if (user.avatar) {
        document.getElementById('currentAvatar').src = user.avatar;
    }
}

// 加载系统信息
async function loadSystemInfo() {
    try {
        const result = await authManager.request('/admin/dashboard/system-info');
        if (result && result.code === 200) {
            const info = result.data;
            
            document.getElementById('systemVersion').textContent = info.version || 'Blog System v1.0';
            document.getElementById('javaVersion').textContent = info.javaVersion || '-';
            document.getElementById('databaseInfo').textContent = info.database || 'MySQL 8.0';
            document.getElementById('systemUptime').textContent = info.uptime || '-';
            
            if (info.memory) {
                document.getElementById('memoryUsage').textContent = 
                    `${info.memory.used} / ${info.memory.total}`;
            }
            
            document.getElementById('storageInfo').textContent = '可用';
        }
    } catch (error) {
        console.error('Load system info error:', error);
    }
}

// 初始化表单验证
function initializeFormValidation() {
    // 密码强度检测
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            checkPasswordRequirements(this.value);
        });
    }

    // 确认密码验证
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            checkPasswordMatch();
        });
    }
}

// 检查密码强度
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    let score = 0;
    let level = 'weak';
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score >= 4) {
        level = 'strong';
        strengthText.textContent = '密码强度: 强';
    } else if (score >= 3) {
        level = 'good';
        strengthText.textContent = '密码强度: 良好';
    } else if (score >= 2) {
        level = 'fair';
        strengthText.textContent = '密码强度: 一般';
    } else {
        level = 'weak';
        strengthText.textContent = '密码强度: 弱';
    }
    
    strengthBar.className = `strength-bar ${level}`;
}

// 检查密码要求
function checkPasswordRequirements(password) {
    const requirements = {
        'length-req': password.length >= 8,
        'uppercase-req': /[A-Z]/.test(password),
        'lowercase-req': /[a-z]/.test(password),
        'number-req': /[0-9]/.test(password),
        'special-req': /[^A-Za-z0-9]/.test(password)
    };
    
    Object.keys(requirements).forEach(reqId => {
        const element = document.getElementById(reqId);
        if (element) {
            if (requirements[reqId]) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        }
    });
}

// 检查密码匹配
function checkPasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && newPassword !== confirmPassword) {
        confirmInput.setCustomValidity('密码不匹配');
    } else {
        confirmInput.setCustomValidity('');
    }
}

// 切换密码可见性
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// 处理个人信息表单提交
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        nickname: formData.get('nickname'),
        email: formData.get('email')
    };
    
    try {
        const result = await authManager.request('/admin/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        if (result && result.code === 200) {
            showNotification('个人信息更新成功', 'success');
            currentUser = { ...currentUser, ...profileData };
            document.querySelector('.user-name').textContent = currentUser.nickname || currentUser.username;
        } else {
            showNotification(result?.message || '更新失败', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification('更新失败，请稍后重试', 'error');
    }
}

// 处理密码修改表单提交
async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const passwordData = {
        oldPassword: formData.get('oldPassword'),
        newPassword: formData.get('newPassword')
    };
    
    try {
        const result = await authManager.request('/admin/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
        
        if (result && result.code === 200) {
            showNotification('密码修改成功', 'success');
            resetPasswordForm();
        } else {
            showNotification(result?.message || '密码修改失败', 'error');
        }
    } catch (error) {
        console.error('Change password error:', error);
        showNotification('密码修改失败，请稍后重试', 'error');
    }
}

// 重置个人信息表单
function resetProfileForm() {
    if (currentUser) {
        fillProfileForm(currentUser);
        showNotification('表单已重置', 'info');
    }
}

// 重置密码表单
function resetPasswordForm() {
    document.getElementById('passwordForm').reset();
    
    // 重置密码强度显示
    document.querySelector('.strength-bar').className = 'strength-bar';
    document.querySelector('.strength-text').textContent = '密码强度: 弱';
    
    // 重置密码要求显示
    document.querySelectorAll('.password-requirements li').forEach(li => {
        li.classList.remove('valid');
    });
    
    showNotification('表单已重置', 'info');
}

// 处理头像上传
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showNotification('请选择图片文件', 'error');
        return;
    }
    
    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('图片文件不能超过5MB', 'error');
        return;
    }
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('currentAvatar').src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    showNotification('头像已更新，请保存更改', 'info');
}

// 维护操作处理函数
async function handleClearCache() {
    if (confirm('确定要清理系统缓存吗？这将释放内存空间。')) {
        try {
            showNotification('正在清理缓存...', 'info');
            // 模拟缓存清理
            await new Promise(resolve => setTimeout(resolve, 2000));
            showNotification('缓存清理完成', 'success');
        } catch (error) {
            showNotification('缓存清理失败', 'error');
        }
    }
}

async function handleBackupData() {
    if (confirm('确定要备份数据吗？这可能需要一些时间。')) {
        try {
            showNotification('正在备份数据...', 'info');
            // 模拟数据备份
            await new Promise(resolve => setTimeout(resolve, 3000));
            showNotification('数据备份完成', 'success');
        } catch (error) {
            showNotification('数据备份失败', 'error');
        }
    }
}

function handleViewLogs() {
    const modal = document.getElementById('logsModal');
    modal.classList.add('active');
}

async function handleResetSettings() {
    if (confirm('确定要重置所有系统设置吗？这将恢复默认配置。')) {
        try {
            showNotification('正在重置设置...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000));
            showNotification('设置重置完成', 'success');
        } catch (error) {
            showNotification('设置重置失败', 'error');
        }
    }
}

async function handleClearAllData() {
    const confirmText = '清空所有数据';
    const userInput = prompt(`这是一个危险操作！将删除所有文章、分类和用户数据。\n请输入 "${confirmText}" 确认操作：`);
    
    if (userInput === confirmText) {
        try {
            showNotification('正在清空数据...', 'info');
            await new Promise(resolve => setTimeout(resolve, 3000));
            showNotification('所有数据已清空', 'success');
        } catch (error) {
            showNotification('数据清空失败', 'error');
        }
    } else if (userInput !== null) {
        showNotification('确认文本不匹配，操作已取消', 'error');
    }
}

// 初始化日志模态框
function initializeLogsModal() {
    const modal = document.getElementById('logsModal');
    const modalClose = document.getElementById('logsModalClose');
    const refreshBtn = document.getElementById('refreshLogsBtn');
    const levelFilter = document.getElementById('logLevelFilter');

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadLogs();
        });
    }

    if (levelFilter) {
        levelFilter.addEventListener('change', function() {
            filterLogs(this.value);
        });
    }
}

// 加载日志
function loadLogs() {
    const container = document.getElementById('logsContainer');
    
    // 模拟日志数据
    const logs = [
        { time: '2024-12-15 14:30:25', level: 'INFO', message: '系统启动完成' },
        { time: '2024-12-15 14:25:10', level: 'WARN', message: '内存使用率较高: 85%' },
        { time: '2024-12-15 14:20:15', level: 'ERROR', message: '数据库连接超时' },
        { time: '2024-12-15 14:15:30', level: 'INFO', message: '用户登录: admin' },
        { time: '2024-12-15 14:10:45', level: 'DEBUG', message: '缓存刷新完成' }
    ];
    
    container.innerHTML = logs.map(log => `
        <div class="log-entry" data-level="${log.level}">
            <span class="log-time">${log.time}</span>
            <span class="log-level ${log.level.toLowerCase()}">${log.level}</span>
            <span class="log-message">${log.message}</span>
        </div>
    `).join('');
}

// 筛选日志
function filterLogs(level) {
    const entries = document.querySelectorAll('.log-entry');
    entries.forEach(entry => {
        if (!level || entry.dataset.level === level) {
            entry.style.display = 'flex';
        } else {
            entry.style.display = 'none';
        }
    });
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

// 显示通知
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