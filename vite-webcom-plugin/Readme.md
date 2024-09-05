# WebComponent Creator 

[查看源代码](https://github.com/boois/vite-webcom-plugin/tree/master)


1. 安装 install
```
npm install vite-webcom-plugin --save-dev
```

2. 配置 config
```
import webcomPlugin from 'vite-webcom-plugin'

export default defineConfig({
  plugins: [webcomPlugin()],
})      
```

3. 在main.ts中使用 use in main.ts
```
import { HelloWorld } from './webcoms/hello-world'

customElements.define('hello-world', HelloWorld)
```

4. 在Html中使用 use in html
```
<hello-world></hello-world>
```
5. 文件结构 file structure
```
src/webcoms/hello-world/index.ts
src/webcoms/hello-world/index.html
src/webcoms/hello-world/index.css
src/webcoms/main.css
```