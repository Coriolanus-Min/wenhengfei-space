// 防止复制内容
document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// 禁用文本选择
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
});

// 禁用保存
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
    }
});

// 检测开发者工具
let devToolsOpen = false;

// 方法1：检测窗口大小变化
window.addEventListener('resize', function() {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
            devToolsOpen = true;
            handleDevTools();
        }
    } else {
        devToolsOpen = false;
    }
});

// 方法2：定时检查控制台
setInterval(function() {
    const d = new Date();
    const element = document.createElement('div');
    element.innerHTML = '';
    const check1 = element.innerHTML.length !== 0;
    
    console.log = function() {};
    console.clear = function() {};
    
    if (check1 || window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) {
        handleDevTools();
    }
}, 1000);

// 方法3：禁用常见开发者工具快捷键
document.addEventListener('keydown', function(e) {
    // 禁用 F12
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    
    // 禁用 Ctrl+Shift+I 和 Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
    }
    
    // 禁用 Ctrl+U（查看源代码）
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
    }
});

// 处理开发者工具被打开的情况
function handleDevTools() {
    // 可以在这里添加自定义处理逻辑
    // 例如：重定向、清空页面内容等
    document.body.innerHTML = '为了保护网站内容，请不要使用开发者工具。';
} 