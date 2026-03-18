# AudioMagic 🎵

一款将音频文件实时转化为动态视觉艺术的 Web 应用。通过音频分析技术，生成与音乐节奏、旋律、情感高度契合的唯美动态画面，打造沉浸式的视听体验。

## 功能特点

### 音频支持
- 支持 MP3、WAV 格式音频文件
- 拖拽上传或点击选择
- 文件大小限制 50MB

### 6种视觉风格

| 风格 | 描述 |
|------|------|
| ✨ 星云 | 紫色/青色/粉色粒子组成的旋转星云，随节奏脉动 |
| 🌌 极光 | 流动的极光幕布效果，高频触发闪烁光点 |
| 🔥 火焰 | 向上升腾的火焰粒子，鼓点时爆炸扩散 |
| 💎 水晶 | 3D水晶多面体，重拍时碎裂重组 |
| 🔮 神经网络 | 发光节点和连接线，节拍时节点跳动 |
| 🫧 气泡 | 马卡龙色气泡从底部升起，鼓点产生新气泡 |

### 节奏同步
- **低频 (Bass)** → 控制粒子大小、波动幅度
- **中频 (Mid)** → 控制运动速度、旋转
- **高频 (Treble)** → 控制透明度、闪烁
- **节拍 (Beat)** → 触发特效、高光时刻

### 播放控制
- 播放/暂停
- 进度条拖动
- 音量调节

## 技术栈

- React 18 + TypeScript
- Vite (构建工具)
- Three.js + React Three Fiber (3D 可视化)
- Web Audio API (音频分析)

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建完成后，产物在 `dist` 目录。

## 使用方法

1. 打开应用后，拖拽或点击选择音频文件
2. 选择喜欢的视觉风格（6种可选）
3. 点击播放按钮开始播放
4. 视觉效果将与音乐实时同步

## 项目结构

```
src/
├── components/
│   ├── Canvas/
│   │   └── scenes/           # 6种视觉风格场景
│   ├── Controls/             # 播放控制组件
│   ├── Panel/               # 风格选择面板
│   └── Upload/              # 音频上传组件
├── hooks/
│   ├── useAudioAnalyzer.ts  # Web Audio API 音频分析
│   └── useAudioPlayer.ts    # 播放控制
├── utils/
│   └── constants.ts         # 常量配置
└── styles/
    └── global.css           # 全局样式
```

## 浏览器兼容性

- Chrome (推荐)
- Edge
- Firefox
- Safari

## License

MIT
