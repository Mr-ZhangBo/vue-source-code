// 至少两个参数 el目的地 vue实例
class Compile{
    constructor(el, vm) {
        // 要遍历的宿主节点
        this.$el = document.querySelector(el)
        this.$vm = vm
        
        // 开始编译
        if (this.$el) {
            // 转换内部内容为片段fragment
            this.$fragment = this.node2Fragment(this.$el)
            // 执行编译
            this.compile(this.$fragment)
            // 将编译完的html结果追加至$el
            this.$el.appendChild(this.$fragment)
        }
    }
    // 将宿主元素中的代码片段拿出来遍历,这样做比较高效
    node2Fragment(el) {
        const frag = document.createDocumentFragment()
        console.log('frag', frag)
        // 将el中所有子元素搬家至frag
        let child
        while (child = el.firstChild) {
            frag.appendChild(child)   
        }
        return frag
    }
    compile(el) {
        const childNodes = el.childNodes
        // console.log(childNodes)
        // console.log(Array.from(childNodes))
        Array.from(childNodes).forEach(node=>{
            // console.log('node', node)
            // console.log('node.nodeName', node.nodeName)
            // console.log('node.nodeType', node.nodeType)
            // 类型判断
            if (this.isElement(node)) {
                // 元素
                console.log('编译元素'+node.nodeName)
            } else if (this.isInterpolation(node)) {
                // 插值文本
                console.log('编译文本'+node.textContent)
                this.compileText(node)
            }
            // 递归
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }
    isElement(node) {
        return node.nodeType === 1
    }
    // 插值文本
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    compileText(node) {
        node.textContent = this.$vm.$data[RegExp.$1]
    }
}