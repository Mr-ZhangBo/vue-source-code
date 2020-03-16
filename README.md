# vue-source-code
vue-source-code-demo

一、响应式
    1.初始化参数 缓存options data
    2.遍历里面参数 observe defineReactive
    3.对象监听 Object.defineProperty() 数据劫持 get set 如果对象的值还是对象需要深度遍历

二、依赖收集(订阅者) 观察者(发布者)
    1.新建Dep和Watcher(初始化 Dep.target = this)
    2.get Dep.target && Dep.addDep(Dep.target) set dep.update()
    3.一个属性对应一个依赖,一个依赖可能有多个监听器(观察者)

三、编译compile
    1.获取dom
        遍历子元素
            编译节点
                遍历属性
                    k-开头
                        k-text(textContent)
                        k-html(处理innerhtml)
                        z-model(监听input)
                    @开头
                        绑定click
            编译文本
    2.接受两个参数 目的地 vue的实例
    3.获取元素查看是否存在(document.querySelector) 缓存$vm
    4.转换内部内容为片段fragment(this.$fragment = this.node2Fragment(this.$el)) createDocumentFragment
    5.执行编译(this.compile(this.$fragment))
    6.将编译完的html结果追加至$el(this.$el.appendChild(this.$fragment))