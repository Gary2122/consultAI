const KEYPREFIX = 'PINIA:STATE'
// 在客户端进行数据持久化
export default (context) =>{
    const {store} = context
    const KEY = KEYPREFIX + store.id

    //存
    window.addEventListener('beforeunload', ()=>{
        const state = store.$state
        const str = JSON.stringify(state)
        localStorage.setItem(KEY, str)
    })

    // 取
    const str = localStorage.getItem(KEY)
    if(!str){
        return
    }
    try{
        const state = JSON.parse(str)
        store.$patch(state)
    }catch(e){
        console.log("存储失败")
    }

}