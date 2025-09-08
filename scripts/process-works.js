require('dotenv').config();
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 配置路径
const WORKS_DIR = path.join(__dirname, '../works');
const OUTPUT_FILE = path.join(__dirname, '../data/works.json');

// 处理所有工作项目
function processWorks() {
    // 读取works目录下的所有.md文件
    const works = fs.readdirSync(WORKS_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(WORKS_DIR, file), 'utf8');
            const { data, content: markdown } = matter(content);
            
            return {
                id: path.basename(file, '.md'),
                ...data,
                details: markdown
            };
        })
        // 按日期排序
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // 写入JSON文件
    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify({ works }, null, 2)
    );

    console.log(`Successfully processed ${works.length} works`);
}

// 监听works目录的变化
fs.watch(WORKS_DIR, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
        console.log(`Detected change in ${filename}, updating works...`);
        processWorks();
    }
});

// 初始处理
processWorks(); 