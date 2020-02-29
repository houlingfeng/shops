module.exports = {
    chainWebpack: config => {
        //发布模式打包入口
        config.when(process.env.NODE_ENV === 'production', config => {
            config.entry('app').clear().add('./src/main-dev.js')

            config.set('externals', {
                
            })

            config.plugin('html').tap(args => {
                args[0].isProd = true
                return args
            })
        })

        //开发模式打包入口
        config.when(process.env.NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main-sdev.js')

            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args
            })
        })
    }
}