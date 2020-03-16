class Vue{
    constructor(options) {
        console.log('options', options)
        this.$options = options
        this.$data = options.data
        this.observe(this.$data)
        new Compile(options.el, this)
        if (options.created) {
            options.created.call(this)
        }
    }
    observe(value) {
        if (!value || typeof value !== 'object') {
            return
        }
        Object.keys(value).forEach(key=>{
            this.defineReactive(value, key, value[key])
        })
    }
    defineReactive(obj, key, val) {
        this.observe(val)

        const dep = new Dep()
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addDep(Dep.target)
                return val;
            },
            set(nVal, oVal) {
                console.log(` 属性发生变化了新值是 ${nVal} 老值是 ${oVal} `)
                if (nVal == oVal) {
                    return
                }
                val = nVal
                dep.notify()
            }
        })
    }
}

// 订阅者
class Dep{
    constructor() {
        // 存储所有依赖
        this.deps = []
    }
    // 依赖收集
    addDep(dep) {
        this.deps.push(dep)
    }
    // 依赖通知
    notify() {
        console.log('this.deps', this.deps)
        this.deps.forEach(key=>{
            dep.update();
        })
    }
}

// 发布者
class Watcher{
    constructor() {
        // 将当前watcher实例指定到Dep静态属性target
        Dep.target = this
    }
    // 更新视图的方法
    update() {
        console.log('属性更新了');
    }
}