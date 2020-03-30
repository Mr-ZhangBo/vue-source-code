class Vue{
    constructor(options) {
        this.$options = options
        this.$data = options.data

        // 1.响应式
        observe(this.$data)

        // 2.代理
        proxy(this, '$data')

        // 3.编译
        new Compile(options.el, this)
    }
}

class Observe{
    constructor(value) {
        this.value = value
        this.walk(value)
    }
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}

// 数组响应式
const originalProto = Array.prototype;
// 备份一份
const arrayProto = Object.create(originalProto)
const arrayMethod = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
arrayMethod.forEach(method => {
    arrayProto[method] = function() {
        // 原始操作
        originalProto[method].apply(this, arguments)
        // 覆盖操作：通知更新
        // console.log('set' + key + ':' + newVal)
        console.log('数组执行:' + method)
    }
})

function observe(val) {
    if (typeof val !== 'object' || val === null) {
        return
    }
    // if (Array.isArray(val)) {
    //     // 覆盖原型
    //     val.__proto__ = arrayProto
    //     const keys = Object.keys(val)
    //     for (let i = 0; i < val.length; i++) {
    //         new Object(val[i])
    //     }
    // }
    new Observe(val)
}

function defineReactive(obj, key, val) {
    observe(val)

    // 创建Dep实例和key一一对应
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            Dep.target && dep.addDep(Dep.target)
            return val
        },
        set(newVal) {
            if (newVal === val) {
                return
            }
            // 如果新的参数是对象
            observe(newVal)
            val = newVal

            // 更新
            // console.log(watchers)
            // watchers.forEach(w=>w.update())
            dep.notify()
        }
    })
}

function proxy(vm, prop) {
    Object.keys(vm[prop]).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm[prop][key]
            },
            set(newVal) {
                vm[prop][key] = newVal
            }
        })
    })
}

// 管理Watcher
class Dep{
    constructor() {
        this.watchers = []
    }
    addDep(watcher) {
        this.watchers.push(watcher)
    }
    notify() {
        this.watchers.forEach(w=>w.update())
    }
}

// Watcher：和模板中的依赖对应
class Watcher{
    constructor(vm, key, updater) {
        this.vm = vm
        this.key = key
        this.updater = updater

        // 建立和Dep关旭
        Dep.target = this
        this.vm[this.key]
        Dep.target = null
    }
    update() {
        this.updater.call(this.vm, this.vm[this.key])
    }
}

// 编译器：解析模板中插件表达式或者指令
class Compile{
    // vm是vue实例用于初始化和更新页面
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = document.querySelector(el);
        this.compile(this.$el)
    }
    compile(el) {
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node=>{
            // 元素类型
            if (this.isElement(node)) {
                // console.log('编译元素', node.nodeName)
                this.compileElement(node)
            } else if (this.isInter(node)) {
                // console.log('编译插值', node.textContent)
                this.compileText(node)
            }
            // 递归
            if (node.childNodes) {
                this.compile(node)
            }
        })
    }
    isElement(node) {
        return node.nodeType === 1
    }
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    // 更新方法
    update(node, exp, dir) {
        const fn = this[dir + 'Updater']
        // 初始化
        fn && fn(node, this.$vm[exp])
        // 更新
        new Watcher(this.$vm, exp, function(val){
            fn && fn(node, val)
        })
    }
    textUpdater(node, val) {
        node.textContent = val
    }
    // 编译插值文本
    compileText(node) {
        // node.textContent = this.$vm[RegExp.$1]
        this.update(node, RegExp.$1, 'text')
    }
    // 编译元素节点：判断它的属性是否是v-xx @xx
    compileElement(node) {
        let nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr => {
            let attrName = attr.name
            let exp = attr.value
            // 如果是指令
            if (this.isDir(attrName)) {
                let dir = attrName.substring(2)
                this[dir] && this[dir](node, exp)
            }
            // 事件处理
            if (this.isEvent(attrName)) {
                let dir = attrName.substring(1)
                // 事件监听
                this.eventHandler(node, exp, dir)
            }
        })
    }
    isDir(attr) {
        return attr.indexOf('v-') === 0
    }
    isEvent(dir) {
        return dir.indexOf('@') === 0
    }
    eventHandler(node, exp, dir) {
        const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
        node.addEventListener(dir, fn.bind(this.$vm))
    }
    // v-text
    text(node, exp) {
        // node.textContent = this.$vm[exp]
        this.update(node, exp, 'text')
    }
    // v-html
    html(node, exp) {
        // node.innerHTML = this.$vm[exp]
        this.update(node, exp, 'html')
    }
    // v-model
    model(node, exp) {
        // update方法只完成赋值和更新
        this.update(node, exp, 'model')
        // 事件监听
        node.addEventListener('input', e => {
            this.$vm[exp] = e.target.value
        })
    }
    modelUpdater(node, val) {
        node.value = val
    }
    htmlUpdater(node, val) {
        node.innerHTML = val
    }
}