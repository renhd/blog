// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已经登录
    if (authManager.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    initializeLoginForm();
});

// 初始化登录表单
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    // 表单提交处理
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        if (!username || !password) {
            showError('请输入用户名和密码');
            return;
        }

        // 设置加载状态
        setLoginLoading(true);
        hideError();

        try {
            const result = await authManager.login(username, password);
            
            if (result.success) {
                // 存储token和用户信息
                authManager.storeToken(result.data.token, rememberMe);
                
                // 显示成功消息
                showSuccess('登录成功，正在跳转...');
                
                // 延迟跳转，让用户看到成功消息
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showError(result.message);
            }
        } catch (error) {
            showError('登录失败，请稍后重试');
        } finally {
            setLoginLoading(false);
        }
    });

    // 输入框事件处理
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', function() {
            hideError();
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // 自动填充演示账户信息
    const demoInfo = document.querySelector('.demo-info');
    if (demoInfo) {
        demoInfo.addEventListener('click', function() {
            usernameInput.value = 'admin';
            passwordInput.value = 'admin123';
            usernameInput.focus();
        });
    }
}

// 设置登录按钮加载状态
function setLoginLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');

    if (loading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
    }
}

// 显示错误消息
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    // 添加抖动动画
    errorMessage.style.animation = 'none';
    errorMessage.offsetHeight; // 触发重排
    errorMessage.style.animation = 'shake 0.5s ease-in-out';
}

// 隐藏错误消息
function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
}

// 显示成功消息
function showSuccess(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.style.background = 'rgba(16, 185, 129, 0.1)';
    errorMessage.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    errorMessage.style.color = '#10b981';
    
    // 更改图标
    const icon = errorMessage.querySelector('i');
    icon.className = 'fas fa-check-circle';
}

// 密码显示/隐藏切换
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// 添加一些UI增强效果
document.addEventListener('DOMContentLoaded', function() {
    // 输入框焦点效果
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // 登录卡片悬停效果
    const loginCard = document.querySelector('.login-card');
    loginCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    loginCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});