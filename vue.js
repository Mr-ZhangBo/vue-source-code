class Vue{
    constructor(options) {
        this.$options = options
        this.$data = options.data

        // 响应式
        observe(this.$data)

        // 代理
        proxy(this, '$data')
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

function observe(val) {
    if (typeof val !== 'object' || val === null) {
        return
    }
    new Observe(val)
}

function defineReactive(obj, key, val) {
    Object.defineProperty(obj, key, {
        get() {
            return val
        },
        set(newVal) {
            if (newVal === val) {
                return
            }
            observe(newVal)
            val = newVal
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