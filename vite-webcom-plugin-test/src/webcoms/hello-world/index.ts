
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
}