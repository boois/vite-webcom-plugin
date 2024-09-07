// vite-plugin-modify.js
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve(process.cwd());

// 创建webcoms目录
if(!fs.existsSync(path.join(__dirname, "src/webcoms"))){
    fs.mkdirSync(path.join(__dirname, "src/webcoms/hello-world"),{recursive:true});
    fs.writeFileSync(path.join(__dirname, "src/webcoms/hello-world/index.html"),`<div id="test">hello webcom!</div>
<!--用$root来获取当前webcom的实例-->
<button onclick="$root.test()">click me</button>

`);
    fs.writeFileSync(path.join(__dirname, "src/webcoms/hello-world/index.ts"),
`
/*
请在main.ts中调用
import { HelloWorld } from './webcoms/hello-world'
customElements.define('hello-world', HelloWorld)
请在index.html中引入
<hello-world></hello-world>
*/
export class HelloWorld extends HTMLElement { 
        constructor(){
            super();
        }
        test(){
            alert("test");
        }
}`);
    fs.writeFileSync(path.join(__dirname, "src/webcoms/hello-world/index.css"),`#test{color:red;}`);
    // 创建 main.css
    fs.writeFileSync(path.join(__dirname, "src/webcoms/main.css"),`* {font-size:24px;}`);
}

export default function webcomPlugin(directory="src/webcoms") { 
    return {
        name: 'webcom-plugin', // 插件名称
        configureServer(server) { 
            // 创建一个虚拟的 CSS 文件,主要是为了后面在shadowdom中的引入，而build会另外真实生成一个这样的东西

            server.middlewares.use(`/main.css`, (req, res) => {
                res.setHeader('Content-Type', 'text/css');
                res.setHeader('Cache-Control', 'no-cache');
                res.end(fs.readFileSync(path.join(__dirname, "src/webcoms/main.css"),"utf-8")); // 这里可以是您的 CSS 内容
            });

            let debounceTimes = {}
            if(! globalThis.wahter ){
                globalThis.wahter = true;
                // 监听指定目录下的所有文件变化
                globalThis.wahter = fs.watch(directory, { recursive: true }, (eventType, filename) => {
                if (filename && Date.now()-(debounceTimes[filename]||0) >300 && !filename.endsWith(".js") && !filename.endsWith(".ts")) {
                    const dir = path.dirname(filename);
                    debounceTimes[filename] = Date.now();
                    if(filename === "main.css"){ // 要求刷新
                        const files = fs.readdirSync(directory, { withFileTypes: true });
                        files.forEach(file => {
                            const filePath = path.join(directory, file.name);
                            if (file.isDirectory()) {
                                // 递归遍历子文件夹
                                const subFiles = fs.readdirSync(filePath, { withFileTypes: true });
                                subFiles.forEach(subFile => {
                                    const subFilePath = path.join(filePath, subFile.name);
                                    if (subFile.isFile() && (subFile.name.endsWith('.ts') || subFile.name.endsWith('.js'))) {
                                        fs.readFile(subFilePath, (err, buffer) => {
                                            if (!err) {
                                                fs.writeFile(subFilePath, buffer, () => {});
                                            }
                                        });
                                    }
                                });
                            } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
                                fs.readFile(filePath, (err, buffer) => {
                                    if (!err) {
                                        fs.writeFile(filePath, buffer, () => {});
                                    }
                                });
                            }
                        });
                    }
                    setTimeout(()=>{
                            console.log(`文件变化: ${dir} / ${filename}`,new Date());
                    },300)
                    // 假如检查到是index.css 或者 index.html变化，这里可以强行保存一次index.js 就会触发热更新
                    // 先看看文件夹下是否有index.js或者ts, 然后保存一下
                    const jsPath = path.join(directory,dir,"index.js");
                    const tsPath = path.join(directory,dir,"index.ts");
                    if(fs.existsSync(tsPath)){
                    fs.readFile(tsPath,(err,buffer)=>{
                        if(!err) fs.writeFile(tsPath,buffer,()=>{});
                    });
                    }
                    if(fs.existsSync(jsPath)){
                        fs.readFile(jsPath,(err,buffer)=>{
                            if(!err) fs.writeFile(jsPath,buffer.toString(),()=>{});
                        });
                    }
                }
                });
            }
        },
        transform(code, id) {
            // 在这里对代码进行修改 例如，添加一行注释
            const pathArr = path
                .relative(__dirname, id)
                .split(path.sep)

            if (pathArr[0] == "src" && pathArr[1] == "webcoms") {

                const cssPath = path.join(pathArr[0], pathArr[1], pathArr[2],"index.css");
                const mainPath = path.join(pathArr[0], pathArr[1], "main.css");
            
                const htmlPath = path.join(pathArr[0], pathArr[1], pathArr[2],"index.html");
                let cssContent = "";
                let htmlContent = "";
                let mainContent = "";
                if(fs.existsSync(cssPath)){
                    cssContent = fs.readFileSync(cssPath,"utf-8");
                }
                if(fs.existsSync(htmlPath)){
                    htmlContent = fs.readFileSync(htmlPath,"utf-8");
                }
                if(fs.existsSync(mainPath)){
                    mainContent = fs.readFileSync(mainPath,"utf-8");
                }

                code = `${code.replace(/\$1/gi, `${Date.now()}`)}`;
                if (id.endsWith(".ts") || id.endsWith(".js")) {
                    code = code.replace(/constructor\s*\(/gi, `_constructor_(`);
                    code = code.replace(/super\s*\(\s*\);*\s*/gi, ``);
                    code = code.replace(
                        /class\s+(\w+)\s+\{|class\s+(\w+)\s+extends\s+HTMLElement\s+\{/gi,
`class $1$2 extends HTMLElement { 
   constructor(...args){
        super();
        this._name = "${pathArr[2]}";
        this.innerHTML = \`${htmlContent.replace(/\$root./gi, "this.getRootNode().host.")}\`;
        this.shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = \`
        ${cssContent}\`;
        const mainLink = document.createElement('link');
        mainLink.href = "main.css";
        mainLink.rel = 'stylesheet';
        this.shadow.appendChild(mainLink)
        this.shadow.appendChild(style);
        Array.from(this.childNodes).forEach(child => {
            this.shadow.appendChild(child);
        });
        this._constructor_(...args);
  }
`
                    );
                }
            }
            return {
                code: code, // 返回修改后的代码
                map: null // 如果不需要源映射，可以返回 null
            };
        },
        generateBundle(options, bundle) {
            // build时,将main.css文件复制到dist目录下
            console.log(options.dir);
            fs.copyFileSync(path.join(__dirname, "src/webcoms/main.css"), path.join(options.dir, "main.css"));
        },
    };
}

