# XMUM Hungry 🍽️

> 厦门大学马来西亚分校校园美食推荐系统  
> 一个基于地图的交互式美食发现平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP Version](https://img.shields.io/badge/php-%3E%3D8.1-8892BF.svg)](https://php.net/)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/bootstrap-5.3.0-7952B3.svg)](https://getbootstrap.com/)

## 📖 项目简介

XMUM Hungry 是专为厦门大学马来西亚分校设计的校园美食推荐系统。通过交互式地图界面，学生和教职工可以轻松发现校园周边的优质餐厅，查看菜品信息，分享用餐体验，并享受个性化的美食推荐服务。

### ✨ 核心特色

- 🗺️ **交互式地图界面** - 基于 Leaflet.js 的实时地图，直观展示餐厅位置
- 🎯 **智能推荐系统** - 多维度推荐算法，支持距离、评分、价格等排序
- 🔍 **高级筛选功能** - 菜系、价格范围、距离、评分等多维度筛选
- 📱 **响应式设计** - 完美适配桌面端和移动端设备
- 🎥 **多媒体支持** - 餐厅和菜品视频展示，增强视觉体验
- ⭐ **用户评价系统** - 支持文字、图片、语音评价，实时更新评分
- 👨‍💼 **管理员后台** - 完整的餐厅和菜品管理功能
- 🔐 **安全认证** - 基于 Session 的用户认证和权限管理

## 🏗️ 技术架构

### 前端技术栈
- **HTML5/CSS3/JavaScript (ES6+)** - 现代Web标准
- **Bootstrap 5.3.0** - 响应式UI框架
- **Leaflet 1.9.4** - 交互式地图组件
- **Web Components** - 组件化架构设计

### 后端技术栈
- **PHP 8.1.2** - 服务端开发语言
- **SQLite 3** - 轻量级数据库
- **RESTful API** - 标准化接口设计
- **Session Management** - 用户状态管理

### 开发工具
- **PHP Built-in Server** - 开发环境服务器
- **SQLite CLI** - 数据库管理工具
- **Modern Browser DevTools** - 前端调试工具

## 📂 项目结构

```
xmum-hungry/
├── 📁 api/                     # 后端API接口
│   ├── api.php                 # 主要API控制器
│   ├── helpers.php             # 工具函数库
│   └── admin_guard.php         # 管理员权限验证
├── 📁 config/                  # 配置文件
│   └── config.php              # 应用程序配置
├── 📁 db/                      # 数据库文件
│   ├── app.sqlite              # SQLite数据库文件
│   ├── schema.sql              # 数据库表结构
│   └── init_data.sql           # 初始化数据
├── 📁 public/                  # Web根目录
│   ├── index.html              # 主页面
│   ├── login.html              # 登录页面
│   ├── detail.html             # 餐厅详情页面
│   ├── admin.html              # 管理员控制台
│   ├── 📁 css/                 # 样式文件
│   │   └── variables.css       # CSS变量定义
│   └── 📁 js/                  # JavaScript文件
│       ├── main.js             # 主应用逻辑
│       └── 📁 components/      # 自定义Web组件
│           ├── map-container.js        # 地图容器组件
│           ├── fab-recommend.js        # 推荐按钮组件
│           ├── fab-filter.js           # 筛选按钮组件
│           ├── filter-sheet.js         # 筛选面板组件
│           ├── mini-card.js            # 餐厅卡片组件
│           ├── toast-msg.js            # 消息提示组件
│           └── upload-modal.js         # 评价上传组件
├── 📁 uploads/                 # 用户上传文件
│   ├── *.jpg                   # 图片文件
│   └── 📁 videos/              # 视频文件
│       └── *.mp4               # 餐厅和菜品视频
├── deployment_info.md          # 部署信息文档
├── final_test_report.md        # 最终测试报告
├── test_results.md             # 测试结果记录
└── README.md                   # 项目说明文档
```

## 🚀 快速开始

### 系统要求

- **PHP 8.1+** 
- **SQLite 3**
- **现代浏览器** (Chrome 88+, Firefox 85+, Safari 14+)

### 本地部署

1. **克隆项目**
```bash
git clone <repository-url>
cd xmum-hungry
```

2. **初始化数据库**
```powershell
# Windows PowerShell
sqlite3 .\db\app.sqlite ".read .\db\schema.sql"
sqlite3 .\db\app.sqlite ".read .\db\init_data.sql"
```

```bash
# Unix/Linux/macOS
sqlite3 ./db/app.sqlite < ./db/schema.sql
sqlite3 ./db/app.sqlite < ./db/init_data.sql
```

3. **启动开发服务器**
```bash
php -S localhost:8000 -t public
```

4. **访问应用**
- 用户端：http://localhost:8000
- 管理端：http://localhost:8000/admin.html

### 测试账户

| 角色 | 邮箱 | 密码 | 权限 |
|------|------|------|------|
| 演示用户 | demo@xmum.edu.my | demo123 | 基础用户权限 |
| 管理员 | admin@xmum.edu.my | admin123 | 完整管理权限 |

## 🎮 功能介绍

### 🗺️ 地图导航
- **实时定位** - 自动获取用户位置，显示附近餐厅
- **餐厅标记** - 地图上直观展示所有餐厅位置
- **距离计算** - 基于哈弗辛公式的精确距离计算
- **路径规划** - 点击餐厅标记查看详细信息

### 🎯 智能推荐
- **多维度排序** - 支持随机、距离、评分、价格排序
- **长按切换** - 长按推荐按钮可切换排序模式
- **个性化推荐** - 基于用户行为的智能推荐算法

### 🔍 高级筛选
- **菜系筛选** - 中式、马来、西式、日式等多种菜系
- **价格范围** - 自定义价格区间筛选
- **距离控制** - 设定搜索半径范围
- **评分过滤** - 按最低评分筛选优质餐厅
- **文本搜索** - 支持餐厅名称和菜品名称搜索

### ⭐ 评价系统
- **多媒体评价** - 支持文字、图片、语音评价
- **实时评分** - 五星评分系统，实时更新餐厅评分
- **评价排序** - 按时间排序，最新评价优先显示
- **匿名评价** - 保护用户隐私的评价机制

### 👨‍💼 管理后台
- **数据统计** - 实时显示用户、餐厅、菜品、评价统计
- **餐厅管理** - 增删改查餐厅信息，支持视频上传
- **地图编辑** - 可视化编辑餐厅位置，拖拽调整坐标
- **用户管理** - 用户账户管理和权限控制

## 🛠️ 开发指南

### API 接口

#### 用户认证
```php
POST /api/api.php?action=login
POST /api/api.php?action=signup
POST /api/api.php?action=logout
GET  /api/api.php?action=checkAuth
```

#### 餐厅数据
```php
GET  /api/api.php?action=getAllRestaurants
GET  /api/api.php?action=filterRestaurants
GET  /api/api.php?action=restDetail&id={id}
GET  /api/api.php?action=random3
```

#### 评价系统
```php
POST /api/api.php?action=addReview
```

#### 管理员接口
```php
GET  /api/api.php?action=admin_getRestaurants
POST /api/api.php?action=admin_addRestaurant
PUT  /api/api.php?action=admin_updateRestaurant
DELETE /api/api.php?action=admin_deleteRestaurant
```

### 数据库结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    pass_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 餐厅表 (restaurants)
```sql
CREATE TABLE restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    cuisines TEXT,
    avg_price INTEGER,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 菜品表 (dishes)
```sql
CREATE TABLE dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rest_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    photo_url TEXT,
    video_url TEXT,
    FOREIGN KEY (rest_id) REFERENCES restaurants(id)
);
```

#### 评价表 (reviews)
```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dish_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    photo_url TEXT,
    audio_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Web组件开发

项目采用现代 Web Components 架构，每个功能模块都是独立的自定义元素：

```javascript
// 示例：创建自定义组件
class MyComponent extends HTMLElement {
    constructor() {
        super();
        // 组件初始化逻辑
    }
    
    connectedCallback() {
        // 组件挂载到DOM时的回调
        this.render();
    }
    
    render() {
        this.innerHTML = `
            <div class="my-component">
                <!-- 组件HTML结构 -->
            </div>
        `;
    }
}

// 注册自定义元素
customElements.define('my-component', MyComponent);
```

## 🧪 测试

### 功能测试清单

- [x] **用户认证系统** - 登录/登出/权限验证
- [x] **地图功能** - 地图显示/标记/交互
- [x] **推荐系统** - 多维度推荐算法
- [x] **筛选功能** - 多维度筛选和搜索
- [x] **详情页面** - 餐厅信息展示
- [x] **评价系统** - 多媒体评价功能
- [x] **管理后台** - 完整管理功能
- [x] **响应式设计** - 移动端适配
- [x] **视频播放** - 多媒体内容支持

### 性能测试

- **页面加载时间** < 2秒
- **地图渲染时间** < 1秒
- **API响应时间** < 500ms
- **数据库查询优化** - 索引优化
- **前端资源优化** - 组件懒加载

## 🚀 部署指南

### 生产环境部署

1. **Web服务器配置**
```apache
# Apache .htaccess 示例
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/api.php [QSA,L]
```

2. **数据库迁移**
```bash
# 生产数据库初始化
sqlite3 production.sqlite < db/schema.sql
sqlite3 production.sqlite < db/init_data.sql
```

3. **环境配置**
```php
// config/config.php 生产环境配置
define('DB_PATH', '/path/to/production.sqlite');
define('UPLOAD_PATH', '/path/to/uploads/');
define('DEBUG_MODE', false);
```

### Docker 部署 (可选)

```dockerfile
FROM php:8.1-apache
COPY . /var/www/html/
RUN apt-get update && apt-get install -y sqlite3
EXPOSE 80
```

## 🤝 贡献指南

欢迎参与项目开发！请遵循以下步骤：

1. **Fork** 项目到你的GitHub账户
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建Pull Request**

### 代码规范

- **PHP** - 遵循 PSR-12 编码标准
- **JavaScript** - 使用 ES6+ 语法，遵循 Airbnb 风格指南
- **CSS** - 使用 BEM 命名规范
- **提交信息** - 遵循 Conventional Commits 规范

## 📄 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- **Leaflet** - 优秀的开源地图库
- **Bootstrap** - 强大的前端UI框架
- **XMUM** - 厦门大学马来西亚分校
- **开源社区** - 提供的各种优秀工具和库

## 📞 联系我们

- **项目仓库**: [GitHub Repository](https://github.com/your-username/xmum-hungry)
- **问题反馈**: [GitHub Issues](https://github.com/your-username/xmum-hungry/issues)
- **技术支持**: 请通过GitHub Issues提交技术问题

---

<div align="center">

**XMUM Hungry** - 让美食发现变得更简单 🍽️

Made with ❤️ for XMUM Community

</div>
