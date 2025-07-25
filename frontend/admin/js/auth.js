// 认证管理类
class AuthManager {
    constructor() {
        this.baseURL = '/api';
        this.token = this.getStoredToken();
    }

    // 获取存储的token
    getStoredToken() {
        return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    }

    // 存储token
    storeToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('admin_token', token);
            sessionStorage.removeItem('admin_token');
        } else {
            sessionStorage.setItem('admin_token', token);
            localStorage.removeItem('admin_token');
        }
        this.token = token;
    }

    // 清除token
    clearToken() {
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
        this.token = null;
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.token && !this.isTokenExpired();
    }

    // 检查token是否过期（简单检查）
    isTokenExpired() {
        if (!this.token) return true;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp < now;
        } catch (e) {
            return true;
        }
    }

    // 获取认证头
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // 登录
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (result.code === 200) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                return {
                    success: false,
                    message: result.message || '登录失败'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: '网络错误，请稍后重试'
            };
        }
    }

    // 登出
    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.baseURL}/admin/logout`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearToken();
            window.location.href = 'index.html';
        }
    }

    // 获取当前用户信息
    async getCurrentUser() {
        try {
            const response = await fetch(`${this.baseURL}/admin/info`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.code === 200) {
                return {
                    success: true,
                    data: result.data
                };
            } else {
                return {
                    success: false,
                    message: result.message || '获取用户信息失败'
                };
            }
        } catch (error) {
            console.error('Get user info error:', error);
            return {
                success: false,
                message: '网络错误'
            };
        }
    }

    // 发送认证请求
    async request(url, options = {}) {
        const isFormData = options.body instanceof FormData;
        const headers = { ...this.getAuthHeaders() };
        
        // 如果是FormData，不设置Content-Type，让浏览器自动设置
        if (isFormData) {
            delete headers['Content-Type'];
        }

        const config = {
            headers,
            ...options
        };

        // 如果需要进度跟踪，使用XMLHttpRequest
        if (options.onUploadProgress) {
            return this.requestWithProgress(url, config);
        }

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            const result = await response.json();

            // 如果返回401，说明token过期，跳转到登录页
            if (response.status === 401) {
                this.clearToken();
                window.location.href = 'index.html';
                return null;
            }

            return result;
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }

    // 支持进度跟踪的请求
    requestWithProgress(url, options) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const method = options.method || 'GET';
            
            xhr.open(method, `${this.baseURL}${url}`);
            
            // 设置认证头
            if (this.token) {
                xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
            }

            // 设置其他头
            if (options.headers) {
                Object.keys(options.headers).forEach(key => {
                    if (key !== 'Authorization') {
                        xhr.setRequestHeader(key, options.headers[key]);
                    }
                });
            }

            // 上传进度
            if (options.onUploadProgress) {
                xhr.upload.addEventListener('progress', options.onUploadProgress);
            }

            xhr.onload = () => {
                if (xhr.status === 401) {
                    this.clearToken();
                    window.location.href = 'index.html';
                    resolve(null);
                    return;
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));

            xhr.send(options.body);
        });
    }
}

// 创建全局认证管理实例
const authManager = new AuthManager();

// 导出到全局
window.authManager = authManager;