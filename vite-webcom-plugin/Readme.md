# WebComponent Creator 

[查看源代码](https://github.com/boois/vite-webcom-plugin/tree/master)


1. 安装 install
```
npm install vite-webcom-plugin --save-dev
```

2. 配置 vite.config.js 如果没有就新建
```
import { defineConfig } from 'vite'
import webcomPlugin from 'vite-webcom-plugin'

export default defineConfig({
  plugins: [webcomPlugin()],
})      
```

3. 在main.ts中使用 use in main.ts
```
import { HelloWorld } from './src/webcoms/hello-world'

customElements.define('hello-world', HelloWorld)
```

4. 在Html中使用 use in html
```
<hello-world></hello-world>
```

5. 运行 npm run dev, 会自动创建webcoms文件夹
   
6. 文件结构 file structure
```
src/webcoms/hello-world/index.ts
src/webcoms/hello-world/index.html
src/webcoms/hello-world/index.css
src/webcoms/main.css
```
1. 修改就会热更新


8. TODO 
    - 目前是强制 shadow dom, 后续可以改成可选 
    - 支持 es5 module