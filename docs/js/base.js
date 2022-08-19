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
const ua = window.navigator.userAgent.toLowerCase()
const list = document.getElementsByTagName('li')

const baseKeys = []
const baseValues = []


window.onload = function () {
    setKeyAndValuesFromDom()
    addCanvasTag()
    clickCheck()
    formCheck()
    imageCheck()
    //setShortCut()
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
    html2canvas(document.body ,{
        allowTaint: true,
        foreignObjectRendering: true
    }).then(s_canvas => {
        let link = document.createElement("a")
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
    if(ua.indexOf('ipad') > -1 || ua.indexOf('macintosh') > -1 && 'ontouchend' in document){
        e.preventDefault()
    }
    let x = e.offsetX
    let y = e.offsetY
    context.lineCap = "round"
    context.beginPath();
    context.moveTo(gX, gY);
    context.lineTo(x, y);
    context.stroke();
    context.closePath();
    
    gX = x;
    gY = y;
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
    canvasTag.style.top = 32
    canvasTag.style.left = 32
    canvasTag.style.cursor = 'auto'
    canvasTag.style.display = 'block'
    canvasTag.style.zIndex = 1003

    canvas = document.getElementById(canvasDomName)
    baseH = Math.max.apply( null, [document.body.clientHeight , document.body.scrollHeight, document.documentElement.scrollHeight, document.documentElement.clientHeight]);
    baseW = Math.max.apply( null, [document.body.clientWidth , document.body.scrollWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    canvas.width = baseW - 32
    canvas.height= baseH - 32

    isBegin = false
    if(ua.indexOf('ipad') > -1 || ua.indexOf('macintosh') > -1 && 'ontouchend' in document){
        canvas.addEventListener('touchstart', startDraw, false)
        canvas.addEventListener('touchmove', Draw, false)
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
        context.clearRect(0, 0, document.getElementById(canvasDomName).width - 32, document.getElementById(canvasDomName).height - 32)
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


function clickCheck(){
  for(let i = 0; i < list.length; i++){
    list[i].addEventListener("click", () =>{
      let element = list[i]
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
        document.querySelectorAll('.brush').forEach(elm => elm.classList.remove('active'))
        context.lineWidth = element.dataset.value
        //context.globalCompositeOperation = 'source-over'
        element.classList.add("active")
        return
      }
    })
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