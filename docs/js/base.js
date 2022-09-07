let isDraw = false
let gX = 0
let gY = 0
let canvas
let context
let isBegin = true
let baseW
let baseH
let downloading = false
let brushSize = 10
let colorValue
let removeCheck =  false
const canvasDomName = "draw_canvas_html"
const storageKey = "__hisotry"
const isiPad = checkiPad()
const isiPhone = checkiPhone()
const list = document.getElementsByTagName('li')

const baseKeys = []
const baseValues = []

const temp_history = []
let history = localStorage


window.onload = () => {
    initHistory()
    setKeyAndValuesFromDom()
    addCanvasTag()
    clickCheck()
    if (document.getElementById("form_url")){
        formCheck()
        imageCheck()
    }
    setShortCut()
}
window.onbeforeunload = () => {
    localStorage.removeItem(storageKey)
}

function initHistory(){
    history.setItem(storageKey, JSON.stringify([]));
}

function deleteCanvas(){
    const context = canvas.getContext('2d')
    context.globalCompositeOperation = 'source-over'
    context.clearRect(0, 0, document.getElementById(canvasDomName).width - 32, document.getElementById(canvasDomName).height - 32)
}


function setHistory(){
    const png = document.getElementById(canvasDomName).toDataURL()
    const histories = JSON.parse(history.getItem(storageKey))
    //後で調整
    setTimeout( () =>{
        histories.unshift({png:png})
        history.setItem(storageKey, JSON.stringify(histories))
        temp = []
    }, 0)
}

function undo(){
    const histories = JSON.parse(history.getItem(storageKey))
    if(histories.length == 0){
        return
    }
    temp_history.unshift(histories.shift());
    //後で調整
    setTimeout(function(){
        history.setItem(storageKey, JSON.stringify(histories))
        deleteCanvas()
        reDraw(histories[0]['png'])
    }, 0)
}

function redo(){
    const histories = JSON.parse(history.getItem(storageKey))
    if(temp_history.length == 0){
        return
    }
    histories.unshift(temp_history.shift())
    //後で調整
    setTimeout( () =>{
        history.setItem(storageKey, JSON.stringify(histories))
        deleteCanvas()
        reDraw(histories[0]['png'])
    }, 0)
}

function reDraw(src) {
    const img = new Image()
    img.src = src
    img.onload = () => {
        canvas.getContext('2d').drawImage(img, 0, 0)
    }
}


function checkiPhone(){
    const ua = window.navigator.userAgent.toLowerCase()
    if (ua.indexOf("iphone") > -1){
        return true
    }
    return false
}

function checkiPad(){
    const ua = window.navigator.userAgent.toLowerCase()
    if(ua.indexOf('ipad') > -1 || ua.indexOf('macintosh') > -1 && 'ontouchend' in document){
        return true
    }
    return false
}


function download(){
    if (!document.getElementById(canvasDomName)){
        alert('can not find draw')
        return false
    }
    //Todo非表示ならDLさせない
    const date = new Date();
    const filename = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) +('0' + date.getDate()).slice(-2) + '_' +  ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2)  + ('0' + date.getSeconds()).slice(-2) + "_" + date.getMilliseconds()
    //base.js:40 Uncaught (in promise) DOMException: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
     let link = document.createElement("a")
    if (isiPhone || isiPad){
        link.href = document.getElementById(canvasDomName).toDataURL("image/png")
        link.download = `${filename}.png`
        link.click()
        downloading = false
        return
    }
    html2canvas(document.body ,{
        allowTaint: true,
        foreignObjectRendering: true
    }).then(s_canvas => {
        link.href = s_canvas.toDataURL("image/png")
        link.download = `${filename}.png`
        link.click()
        downloading = false
    });
    
}


function startDraw(e){
    if (isBegin){
        return
    }
    isDraw = true
    gX = e.offsetX
    gY = e.offsetY
}

function Draw(e){
    if(!isDraw){
        return
    }
    let x = e.offsetX
    let y = e.offsetY
    if(isiPad || isiPhone){
        e.preventDefault()
        const touch = e.touches[0]
        if (touch.touchType === 'stylus'){
            x =  e.touches[0].pageX - 26
            y =  e.touches[0].pageY - 26
        }else{
            x = e.touches[0].pageX - 26
            y = e.touches[0].pageY
        }
    }
    context.lineCap = "round"
    context.beginPath()
    context.moveTo(gX, gY)
    context.lineTo(x, y)
    context.stroke()
    context.closePath()
    gX = x
    gY = y
}

function startDraw(e){
    if (isBegin){
        return
    }
    isDraw = true
    gX = e.offsetX
    gY = e.offsetY
}

function endDraw(){
    setHistory()
    isDraw = false
}

function addCanvasTag(){
    if (document.getElementById(canvasDomName)){
        return false
    }
    const canvasTag = document.createElement('canvas')
    document.body.appendChild(canvasTag)
    canvasTag.id = canvasDomName
    canvasTag.style.position = "absolute"
    if (isiPhone){
        canvasTag.style.top = 0
    }else{
        canvasTag.style.top = 32
    }
    canvasTag.style.left = 32
    canvasTag.style.cursor = 'auto'
    canvasTag.style.display = 'block'
    canvasTag.style.zIndex = 1003

    canvas = document.getElementById(canvasDomName)
    baseH = Math.max.apply( null, [document.body.clientHeight , document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight]);
    baseW = Math.max.apply( null, [document.body.clientWidth , document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    canvas.width = baseW - 32
    if (isiPhone){
        canvas.height= baseH
        canvas.width = baseW
    }else{
        canvas.height= baseH - 32
    }
    isBegin = false
    if(isiPad || isiPhone){
        canvas.addEventListener('touchstart', startDraw, false)
        canvas.addEventListener('touchmove', Draw,  false)
        canvas.addEventListener('touchend', endDraw, false)
    }else{
        canvas.addEventListener('mousedown', startDraw, false)
        canvas.addEventListener('mousemove', Draw, false)
        canvas.addEventListener('mouseup', endDraw, false)
    }
    context = canvas.getContext('2d')
    context.lineWidth = brushSize
    context.strokeStyle = colorValue
}

function setUrl(){
    const url = document.getElementById("form_url").value
    if (url == ""){
        document.querySelector('main').style.background = 'none'
        //document.mainFrame.location.href = "./base.html"
        document.getElementById("mainFrame").src = "./base.html"
        return
    }

    try{
        document.querySelector('main').style.background = 'none'
        //document.mainFrame.location.href = url
        document.getElementById("mainFrame").src = url
    }catch(err){
        alert("This URL does NOT support Cross Domain")
    }
}


function removeCanvas(){
    if (!removeCheck){
        return false
    }
    removeCheck = false
    if (confirm('Are you sure?') == false){
        removeCheck = false
        return false
    } else{
        context = canvas.getContext('2d')
        context.globalCompositeOperation = 'source-over'
        context.clearRect(0, 0, document.getElementById(canvasDomName).width, document.getElementById(canvasDomName).height)
        removeCheck = false
        document.querySelector('main').style.background = 'none'
        return
    }
}


function toggleCanvas(element){
    //alert(1)
    if (!document.getElementById(canvasDomName)){
        return false
    }
    if (document.getElementById(canvasDomName).style.zIndex == 1003){
        document.getElementById(canvasDomName).style.zIndex = -100
        document.getElementById(canvasDomName).style.display = "none"
        element.classList.remove("active")
        element.children[0].style.display = 'none'
        element.children[1].style.display = 'inline'
        return
    }
    document.getElementById(canvasDomName).style.zIndex = 1003
    element.classList.add("active")
    element.children[0].style.display = 'inline'
    element.children[1].style.display = 'none'
    canvas.style.display = "block"
}


function setKeyAndValuesFromDom(){
  for(let i = 0; i < list.length; i++){
    let element = list[i]
    baseKeys.push(element.dataset.name)
    baseValues.push(element.dataset.value)
  }
}

function _toolbarAction(element){
  if (element.dataset.name == "help"){
    return
  }
  if (element.dataset.name == "delete"){
    removeCheck = true
    removeCanvas()
    return
  }
  if (element.dataset.name == "save"){
    download()
    return
  }
  if( element.dataset.name == "show_hide" ){
    toggleCanvas(element)
    return
  }
  if ( element.dataset.name == "undo"){
    undo()
    return
  }
  if ( element.dataset.name == "redo"){
    redo()
    return
  }
  let send_hash = {}
  if ( element.classList.contains('color') == true ){
    document.querySelectorAll('.color').forEach(elm => elm.classList.remove('active'))
    if(element.dataset.value == "erase"){
        context.globalCompositeOperation = 'destination-out'
        element.classList.add("active")
        return
    }
    context.strokeStyle = element.dataset.value
    context.globalCompositeOperation = 'source-over'
    element.classList.add("active")
    return
  }
  if ( element.classList.contains('brush') == true ){
    //console.log("ok")
    document.querySelectorAll('.brush').forEach(elm => elm.classList.remove('active'))
    context.lineWidth = element.dataset.value
    //context.globalCompositeOperation = 'source-over'
    element.classList.add("active")
    return
  }
}


function clickCheck(){
  for(let i = 0; i < list.length; i++){
    if (isiPhone || isiPad){
        list[i].addEventListener("touchstart", () =>{
            let element = list[i]
            _toolbarAction(element)
        },  {passive: true})
    }else{
        list[i].addEventListener("click", () =>{
            let element = list[i]
            _toolbarAction(element)
        })
    }
  }
}

function formCheck(){
    document.getElementById("form_url").addEventListener('keypress', (e) => {
        if (e.keyCode === 13){
            setUrl()
        }
        return false
    })
}

function imageCheck(){
    const main = document.querySelector('main')
    document.getElementById("form_image").addEventListener('change', (event) => {
        const file = event.target.files[0]
        const reader = new FileReader()
        main.style.backgroundImage = 'none'
        document.getElementById("mainFrame").src =''
        reader.onload = (e) =>{
            const base64Text = e.currentTarget.result
            if (file.type === "application/pdf"){
                console.log("pdf")
                document.getElementById("mainFrame").src = base64Text
                return
            }else{
                main.style.backgroundImage = `url(${base64Text})`
                main.style.backgroundSize = "contain"
                main.style.backgroundRepeat = "no-repeat"
            }
        }
        reader.readAsDataURL(file)
    })
}


function setShortCut(){
    shortcut.add("Alt+Z", function() {undo()})
    shortcut.add("Alt+Shift+Z", function() {redo()})
    shortcut.add("Alt+B", function(){removeCanvas()})
    shortcut.add("Alt+S", function(){_toolbarAction(list[0])})
    shortcut.add("Alt+D", function(){_toolbarAction(list[1])})
    shortcut.add("Alt+F", function(){_toolbarAction(list[2])})
    shortcut.add("Alt+V", function(){toggleCanvas()})
    //download はなし
    shortcut.add("Alt+A", function(){_toolbarAction(list[5])})
    //black
    shortcut.add("Alt+Q", function(){_toolbarAction(list[6])})
    shortcut.add("Alt+W", function(){_toolbarAction(list[7])})
    shortcut.add("Alt+R", function(){_toolbarAction(list[8])})
    shortcut.add("Alt+T", function(){_toolbarAction(list[9])})
    shortcut.add("Alt+G", function(){_toolbarAction(list[10])})
}