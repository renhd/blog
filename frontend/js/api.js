// API 配置和请求工具类
class BlogAPI {
    constructor(baseURL = 'http://localhost:8080/api') {
        this.baseURL = baseURL;
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // 处理Spring Boot Result格式
            if (result && typeof result === 'object' && 'code' in result) {
                if (result.code === 200) {
                    return result.data;
                } else {
                    throw new Error(result.message || 'API request failed');
                }
            }
            
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // 获取所有文章分类
    async getCategories() {
        return this.request('/categories');
    }

    // 获取文章列表
    async getPosts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/blog-posts?${queryString}` : '/blog-posts';
        return this.request(endpoint);
    }

    // 根据分类获取文章
    async getPostsByCategory(category, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/blog-posts/category/${category}?${queryString}` : `/blog-posts/category/${category}`;
        return this.request(endpoint);
    }

    // 获取单篇文章详情
    async getPost(postId) {
        return this.request(`/blog-posts/${postId}`);
    }

    // 获取最新文章
    async getRecentPosts(limit = 5) {
        return this.request(`/blog-posts/published?current=1&size=${limit}`);
    }

    // 获取精选文章
    async getFeaturedPosts(limit = 3) {
        return this.request(`/blog-posts/published?current=1&size=${limit}`);
    }

    // 搜索文章
    async searchPosts(query, params = {}) {
        const searchParams = new URLSearchParams({ q: query, ...params }).toString();
        return this.request(`/blog-posts/search?${searchParams}`);
    }
}

// 创建API实例
const blogAPI = new BlogAPI();

// 创建简化的api对象，用于向后兼容
const api = {
    get: async (endpoint) => {
        return {
            code: 200,
            data: await blogAPI.request(endpoint)
        };
    },
    post: async (endpoint, data) => {
        return {
            code: 200,
            data: await blogAPI.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            })
        };
    },
    put: async (endpoint, data) => {
        return {
            code: 200,
            data: await blogAPI.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
        };
    },
    delete: async (endpoint) => {
        return {
            code: 200,
            data: await blogAPI.request(endpoint, {
                method: 'DELETE'
            })
        };
    }
};

// 导出API实例
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogAPI, blogAPI, api };
} else {
    window.BlogAPI = BlogAPI;
    window.blogAPI = blogAPI;
    window.api = api;
}