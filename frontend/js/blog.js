// 全局数据存储
let posts = [];
let categories = [];

let currentView = 'home';
let currentPost = null;

// 移动端菜单控制
function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    const toggleBtn = document.querySelector('.mobile-menu-toggle i');
    
    navLinks.classList.toggle('active');
    
    // 切换图标
    if (navLinks.classList.contains('active')) {
        toggleBtn.className = 'fas fa-times';
    } else {
        toggleBtn.className = 'fas fa-bars';
    }
}

// 关闭移动端菜单（点击链接后）
function closeMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    const toggleBtn = document.querySelector('.mobile-menu-toggle i');
    
    navLinks.classList.remove('active');
    toggleBtn.className = 'fas fa-bars';
}

// 主题管理
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // 更新Mermaid主题
    updateMermaidTheme();
    
    // 添加切换动画
    document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
    
    // 移动端关闭菜单
    if (window.innerWidth <= 768) {
        closeMobileMenu();
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// 搜索功能
function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.summary.toLowerCase().includes(query.toLowerCase()) ||
        post.category.toLowerCase().includes(query.toLowerCase())
    );
    
    displaySearchResults(filteredPosts, query);
}

function displaySearchResults(results, query) {
    currentView = 'search';
    document.getElementById('home-content').style.display = 'none';
    document.getElementById('post-list').style.display = 'block';
    document.getElementById('post-content').style.display = 'none';
    
    // 隐藏回到顶部按钮
    hideScrollButton();
    
    const pageHeader = document.querySelector('#post-list .page-header h2');
    pageHeader.innerHTML = `<i class="fas fa-search"></i> 搜索结果: "${query}"`;
    
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';
    
    if (results.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">未找到相关文章</div>';
        return;
    }
    
    results.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.appendChild(postCard);
    });
    
    addPageTransition();
}

// 搜索框回车事件
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 检查是否需要显示回到顶部按钮
function checkScrollButton() {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    const postActions = document.querySelector('.post-actions');
    
    if (!scrollTopBtn || !postActions) return;
    
    // 检查页面内容高度是否超过视窗高度
    const contentHeight = document.body.scrollHeight;
    const viewHeight = window.innerHeight;
    
    if (contentHeight > viewHeight * 1.5) {
        // 内容超过1.5屏时显示按钮
        postActions.style.display = 'flex';
        scrollTopBtn.style.display = 'inline-flex';
    } else {
        // 内容较短时隐藏按钮
        postActions.style.display = 'none';
    }
}

// 隐藏回到顶部按钮
function hideScrollButton() {
    const postActions = document.querySelector('.post-actions');
    if (postActions) {
        postActions.style.display = 'none';
    }
}

// 监听窗口大小变化，重新检查按钮显示
window.addEventListener('resize', () => {
    if (currentView === 'post') {
        setTimeout(checkScrollButton, 100);
    }
});

// 页面过渡动画
function addPageTransition() {
    const mainContent = document.querySelector('.main-content');
    mainContent.classList.remove('page-transition', 'active');
    mainContent.classList.add('page-transition');
    
    requestAnimationFrame(() => {
        mainContent.classList.add('active');
    });
}

// 创建文章卡片
function createPostCard(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card';
    const displayDate = post.createTime || post.date || '未知日期';
    
    postCard.innerHTML = `
        <h3><a href="#" onclick="showPost(${post.id})">${post.title}</a></h3>
        <div class="post-meta">
            <span class="meta-item">
                <i class="fas fa-calendar"></i>
                ${displayDate}
            </span>
            <span class="meta-item">
                <i class="fas fa-folder"></i>
                ${post.category}
            </span>
            <span class="meta-item">
                <i class="fas fa-eye"></i>
                ${post.viewCount || 0} 次浏览
            </span>
        </div>
        <p>${post.summary || '暂无摘要'}</p>
    `;
    
    return postCard;
}

// 更新统计数据
function updateStats() {
    const totalPosts = posts.length;
    const totalCategories = categories.length;
    const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
    
    const totalPostsElement = document.getElementById('total-posts');
    const totalCategoriesElement = document.getElementById('total-categories');
    const totalViewsElement = document.getElementById('total-views');
    
    if (totalPostsElement) {
        animateNumber(totalPostsElement, totalPosts);
    }
    if (totalCategoriesElement) {
        animateNumber(totalCategoriesElement, totalCategories);
    }
    if (totalViewsElement) {
        animateNumber(totalViewsElement, totalViews);
    }
}

// 渲染Mermaid图表
async function renderMermaidCharts(container) {
    if (typeof mermaid === 'undefined') {
        console.warn('Mermaid 库未加载');
        return;
    }
    
    try {
        // 查找所有的mermaid代码块
        const mermaidBlocks = container.querySelectorAll('pre code.language-mermaid, code.language-mermaid');
        
        for (let i = 0; i < mermaidBlocks.length; i++) {
            const block = mermaidBlocks[i];
            const mermaidCode = block.textContent || block.innerText;
            
            // 创建一个新的div来包含mermaid图表
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid-chart';
            mermaidDiv.id = `mermaid-${Date.now()}-${i}`;
            
            // 用mermaid div替换原来的code块
            const preElement = block.closest('pre') || block;
            preElement.parentNode.insertBefore(mermaidDiv, preElement);
            preElement.remove();
            
            // 渲染mermaid图表
            try {
                const { svg } = await mermaid.render(mermaidDiv.id + '-svg', mermaidCode);
                mermaidDiv.innerHTML = svg;
                
                // 添加图表容器样式
                mermaidDiv.style.textAlign = 'center';
                mermaidDiv.style.margin = '20px 0';
                mermaidDiv.style.padding = '10px';
                mermaidDiv.style.border = '1px solid var(--border-color, #ddd)';
                mermaidDiv.style.borderRadius = '8px';
                mermaidDiv.style.backgroundColor = 'var(--card-bg, #fff)';
                
                console.log(`Mermaid 图表 ${i + 1} 渲染成功`);
            } catch (renderError) {
                console.error(`Mermaid 图表渲染失败:`, renderError);
                // 如果渲染失败，显示错误信息
                mermaidDiv.innerHTML = `
                    <div class="mermaid-error">
                        <strong>流程图渲染失败</strong>
                        <small>请检查语法是否正确</small>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('处理 Mermaid 图表时出错:', error);
    }
}

// 更新Mermaid主题
function updateMermaidTheme() {
    if (typeof mermaid !== 'undefined') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const mermaidTheme = currentTheme === 'dark' ? 'dark' : 'default';
        
        try {
            mermaid.initialize({
                startOnLoad: false,
                theme: mermaidTheme,
                themeCSS: `
                    .mermaidTooltip {
                        background: var(--card-bg, #fff);
                        border: 1px solid var(--border-color, #ddd);
                        color: var(--text-color, #333);
                    }
                `,
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true
                },
                sequence: {
                    useMaxWidth: true
                },
                gantt: {
                    useMaxWidth: true
                }
            });
            
            // 如果当前显示的是文章页面，重新渲染图表
            if (currentView === 'post' && currentPost) {
                setTimeout(() => {
                    const articleContent = document.getElementById('article-content');
                    if (articleContent) {
                        renderMermaidCharts(articleContent);
                    }
                }, 100);
            }
        } catch (error) {
            console.warn('更新 Mermaid 主题失败:', error);
        }
    }
}
function animateNumber(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// 加载外部库的Promise包装
function loadExternalLibraries() {
    return new Promise((resolve) => {
        let markedLoaded = false;
        let hlJsLoaded = false;
        let mermaidLoaded = false;
        
        function checkAllLoaded() {
            if (markedLoaded && hlJsLoaded && mermaidLoaded) {
                resolve();
            }
        }
        
        // 检查marked是否已加载
        if (typeof marked !== 'undefined') {
            markedLoaded = true;
        } else {
            // 监听marked加载
            const checkMarked = setInterval(() => {
                if (typeof marked !== 'undefined') {
                    markedLoaded = true;
                    clearInterval(checkMarked);
                    checkAllLoaded();
                }
            }, 100);
            
            // 超时处理
            setTimeout(() => {
                clearInterval(checkMarked);
                markedLoaded = true; // 标记为已加载以免阻塞
                checkAllLoaded();
            }, 3000);
        }
        
        // 检查highlight.js是否已加载
        if (typeof hljs !== 'undefined') {
            hlJsLoaded = true;
        } else {
            // 监听hljs加载
            const checkHljs = setInterval(() => {
                if (typeof hljs !== 'undefined') {
                    hlJsLoaded = true;
                    clearInterval(checkHljs);
                    checkAllLoaded();
                }
            }, 100);
            
            // 超时处理
            setTimeout(() => {
                clearInterval(checkHljs);
                hlJsLoaded = true; // 标记为已加载以免阻塞
                checkAllLoaded();
            }, 3000);
        }
        
        // 检查mermaid是否已加载
        if (typeof mermaid !== 'undefined') {
            mermaidLoaded = true;
        } else {
            // 监听mermaid加载
            const checkMermaid = setInterval(() => {
                if (typeof mermaid !== 'undefined') {
                    mermaidLoaded = true;
                    clearInterval(checkMermaid);
                    checkAllLoaded();
                }
            }, 100);
            
            // 超时处理
            setTimeout(() => {
                clearInterval(checkMermaid);
                mermaidLoaded = true; // 标记为已加载以免阻塞
                checkAllLoaded();
            }, 3000);
        }
        
        checkAllLoaded();
    });
}

function loadHighlightJS() {
    if (typeof hljs !== 'undefined') {
        console.log('highlight.js already loaded');
        return;
    }
    
    // 尝试加载highlight.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.onload = function() {
        console.log('highlight.js loaded successfully');
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    };
    script.onerror = function() {
        console.warn('Failed to load highlight.js from CDN');
    };
    document.head.appendChild(script);
}

// 数据加载函数
async function loadBlogData() {
    try {
        // 显示加载状态
        showLoadingState();
        
        // 并行加载分类和文章数据
        const [categoriesData, postsData] = await Promise.all([
            blogAPI.getCategories(),
            blogAPI.getPosts()
        ]);
        
        categories = categoriesData || [];
        // 处理分页数据格式
        posts = postsData && postsData.records ? postsData.records : (Array.isArray(postsData) ? postsData : []);
        
        // 数据加载完成后更新界面
        updateSidebar();
        updateStats();
        showHome();
        hideLoadingState();
        addPageTransition();
        
        console.log('博客数据加载成功');
    } catch (error) {
        console.error('加载博客数据失败:', error);
        showErrorState('加载数据失败，请检查网络连接或稍后重试');
    }
}

// 显示加载状态
function showLoadingState() {
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('loading');
        
        // 添加加载指示器
        if (!document.getElementById('loading-indicator')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-indicator';
            loadingDiv.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>正在加载博客数据...</p>
                </div>
            `;
            document.body.appendChild(loadingDiv);
        }
    }
}

// 隐藏加载状态
function hideLoadingState() {
    const container = document.querySelector('.container');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (container) {
        container.classList.remove('loading');
    }
    
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// 显示错误状态
function showErrorState(message) {
    hideLoadingState();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>⚠️ 加载失败</h3>
            <p>${message}</p>
            <button onclick="retryLoadData()" class="retry-btn">重试</button>
        </div>
    `;
    
    // 替换主要内容区域
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(errorDiv);
    }
}

// 重试加载数据
async function retryLoadData() {
    await loadBlogData();
}

async function updateSidebar() {
    const recentPostsList = document.getElementById('recent-posts');
    const categoriesList = document.getElementById('categories');
    
    if (!recentPostsList || !categoriesList) return;
    
    try {
        // 更新最新文章
        recentPostsList.innerHTML = '';
        if (posts.length > 0) {
            const recentPosts = posts.slice(0, 5);
            recentPosts.forEach(post => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" onclick="showPost(${post.id})">${post.title}</a>`;
                recentPostsList.appendChild(li);
            });
        } else {
            recentPostsList.innerHTML = '<li>暂无文章</li>';
        }
        
        // 更新分类
        categoriesList.innerHTML = '';
        if (categories.length > 0) {
            categories.forEach(category => {
                const li = document.createElement('li');
                const postCount = posts.filter(post => post.category === category.name).length;
                li.innerHTML = `<a href="#" onclick="showCategory('${category.name}')">${category.name} (${postCount})</a>`;
                categoriesList.appendChild(li);
            });
        } else {
            categoriesList.innerHTML = '<li>暂无分类</li>';
        }
    } catch (error) {
        console.error('更新侧边栏失败:', error);
    }
}

async function showHome() {
    currentView = 'home';
    document.getElementById('home-content').style.display = 'block';
    document.getElementById('post-list').style.display = 'none';
    document.getElementById('post-content').style.display = 'none';
    
    // 关闭移动端菜单
    closeMobileMenu();
    
    // 隐藏回到顶部按钮
    hideScrollButton();
    
    const featuredPosts = document.getElementById('featured-posts');
    featuredPosts.innerHTML = '';
    
    try {
        // 如果本地还没有数据，尝试加载精选文章
        if (posts.length === 0) {
            const featuredData = await blogAPI.getFeaturedPosts(3);
            // 处理分页数据格式
            const featuredPostsArray = featuredData && featuredData.records ? featuredData.records : (Array.isArray(featuredData) ? featuredData : []);
            displayFeaturedPosts(featuredPostsArray);
        } else {
            // 使用本地数据显示精选文章
            displayFeaturedPosts(posts.slice(0, 3));
        }
    } catch (error) {
        console.error('加载精选文章失败:', error);
        displayFeaturedPosts(posts.slice(0, 3)); // 回退到本地数据
    }
    
    addPageTransition();
}

function displayFeaturedPosts(featuredPosts) {
    const featuredPostsContainer = document.getElementById('featured-posts');
    
    featuredPosts.forEach(post => {
        const postCard = createPostCard(post);
        postCard.querySelector('h3').innerHTML = postCard.querySelector('h3').innerHTML.replace('h3', 'h4');
        featuredPostsContainer.appendChild(postCard);
    });
}

function showAllPosts() {
    currentView = 'list';
    document.getElementById('home-content').style.display = 'none';
    document.getElementById('post-list').style.display = 'block';
    document.getElementById('post-content').style.display = 'none';
    
    // 关闭移动端菜单
    closeMobileMenu();
    
    // 隐藏回到顶部按钮
    hideScrollButton();
    
    const pageHeader = document.querySelector('#post-list .page-header h2');
    pageHeader.innerHTML = '<i class="fas fa-list"></i> 所有文章';
    
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.appendChild(postCard);
    });
    
    addPageTransition();
}

async function showPost(postId) {
    try {
        // 先从本地缓存查找
        let post = posts.find(p => p.id === postId);
        
        // 如果本地没有找到，尝试从API获取
        if (!post) {
            post = await blogAPI.getPost(postId);
        }
        
        if (!post) {
            console.error('文章未找到:', postId);
            return;
        }
        
        currentView = 'post';
        currentPost = post;
        
        document.getElementById('home-content').style.display = 'none';
        document.getElementById('post-list').style.display = 'none';
        document.getElementById('post-content').style.display = 'block';
        
        const articleContent = document.getElementById('article-content');
        let markdownContent;
        
        // 安全地渲染Markdown内容
        try {
            if (typeof marked !== 'undefined' && marked.parse) {
                console.log('使用 marked.parse() 渲染内容');
                markdownContent = marked.parse(post.content);
            } else if (typeof marked !== 'undefined' && marked) {
                console.log('使用 marked() 渲染内容');
                markdownContent = marked(post.content);
            } else {
                console.warn('marked库未加载，使用简单文本替换');
                // 如果marked未加载，使用简单的文本替换
                markdownContent = post.content
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>');
            }
        } catch (error) {
            console.warn('Markdown渲染失败，使用原始内容:', error);
            markdownContent = post.content.replace(/\n/g, '<br>');
        }
        
        const displayDate = post.createTime || post.date || '未知日期';
        
        articleContent.innerHTML = `
            <h1>${post.title}</h1>
            <p class="post-meta">${displayDate} · ${post.category}</p>
            <div class="post-body">${markdownContent}</div>
        `;
        
        // 为表格添加响应式容器
        const tables = articleContent.querySelectorAll('.post-body table');
        tables.forEach(table => {
            if (!table.parentElement.classList.contains('table-container')) {
                const container = document.createElement('div');
                container.className = 'table-container';
                table.parentNode.insertBefore(container, table);
                container.appendChild(table);
            }
        });
        
        // 检查是否需要显示回到顶部按钮
        setTimeout(async () => {
            checkScrollButton();
            
            // 应用代码高亮
            if (typeof hljs !== 'undefined') {
                try {
                    hljs.highlightAll();
                } catch (error) {
                    console.warn('代码高亮应用失败:', error);
                }
            }
            
            // 渲染Mermaid图表
            try {
                await renderMermaidCharts(articleContent);
            } catch (error) {
                console.warn('Mermaid图表渲染失败:', error);
            }
        }, 100);
    } catch (error) {
        console.error('加载文章失败:', error);
        showErrorState('文章加载失败，请稍后重试');
    }
}

async function showCategory(category) {
    currentView = 'category';
    document.getElementById('home-content').style.display = 'none';
    document.getElementById('post-list').style.display = 'block';
    document.getElementById('post-content').style.display = 'none';
    
    // 隐藏回到顶部按钮
    hideScrollButton();
    
    const pageHeader = document.querySelector('#post-list .page-header h2');
    pageHeader.innerHTML = `<i class="fas fa-tags"></i> 分类：${category}`;
    
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '<div class="loading-posts">正在加载文章...</div>';
    
    try {
        // 尝试从API获取分类文章
        let categoryPosts;
        try {
            const categoryData = await blogAPI.getPostsByCategory(category);
            // 处理分页数据格式
            categoryPosts = categoryData && categoryData.records ? categoryData.records : (Array.isArray(categoryData) ? categoryData : []);
        } catch (apiError) {
            // API失败时回退到本地数据
            console.warn('API获取分类文章失败，使用本地数据:', apiError);
            categoryPosts = posts.filter(post => post.category === category);
        }
        
        postsContainer.innerHTML = '';
        
        if (categoryPosts.length === 0) {
            postsContainer.innerHTML = '<div class="no-posts">该分类下暂无文章</div>';
            return;
        }
        
        categoryPosts.forEach(post => {
            const postCard = createPostCard(post);
            postsContainer.appendChild(postCard);
        });
        
        addPageTransition();
    } catch (error) {
        console.error('加载分类文章失败:', error);
        postsContainer.innerHTML = '<div class="error-posts">加载失败，请稍后重试</div>';
    }
}

// 初始化博客应用
async function initializeBlog() {
    try {
        // 初始化主题
        initTheme();
        
        // 等待外部库加载完成
        await loadExternalLibraries();
        
        // 配置marked选项
        if (typeof marked !== 'undefined') {
            try {
                marked.setOptions({
                    highlight: function(code, lang) {
                        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(code, { language: lang }).value;
                            } catch (err) {
                                console.warn('代码高亮失败:', err);
                            }
                        }
                        return typeof hljs !== 'undefined' ? hljs.highlightAuto(code).value : code;
                    },
                    breaks: true,
                    gfm: true
                });
            } catch (error) {
                console.warn('marked配置失败:', error);
            }
        }
        
        // 初始化Mermaid
        if (typeof mermaid !== 'undefined') {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
                    themeCSS: `
                        .mermaidTooltip {
                            background: var(--card-bg, #fff);
                            border: 1px solid var(--border-color, #ddd);
                            color: var(--text-color, #333);
                        }
                    `,
                    flowchart: {
                        useMaxWidth: true,
                        htmlLabels: true
                    },
                    sequence: {
                        useMaxWidth: true
                    },
                    gantt: {
                        useMaxWidth: true
                    }
                });
                console.log('Mermaid 初始化成功');
            } catch (error) {
                console.warn('Mermaid 初始化失败:', error);
            }
        }
        
        // 加载博客数据
        await loadBlogData();
        
        console.log('博客初始化完成');
    } catch (error) {
        console.error('初始化博客失败:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // 初始化搜索功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // 延迟初始化，确保DOM完全加载
    setTimeout(initializeBlog, 100);
});