var sw = 20, //宽
    sh = 20, //高
    tr = 30, //行数  
    td = 30 //列数

var snake = null, //蛇的实例
    food = null,
    game = null //游戏实例


function Square(x, y, classname) {
    this.x = x * sw
    this.y = y * sh
    this.class = classname

    this.viewContent = document.createElement('div') //方块对应的dom元素
    this.viewContent.className = this.class
    this.parent = document.getElementById('snakeWrap') //方块的父级

}
Square.prototype.create = function () { //创建方块dom,并添加到页面
    this.viewContent.style.position = 'absolute'
    this.viewContent.style.width = sw + 'px'
    this.viewContent.style.height = sh + 'px'
    this.viewContent.style.left = this.x + 'px'
    this.viewContent.style.top = this.y + 'px'

    this.parent.appendChild(this.viewContent)

}
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent)
}
//蛇
function Snake() {
    this.head = null //存一下蛇头的信息
    this.tail = null //蛇尾
    this.pos = [
        /* [0,0],
        [1,0], */

    ] //蛇的身体每个方块的位置
    this.directionNum = { //存储蛇走的方向，用一个对象表示
        left: {
            x: -1,
            y: 0,
            rotate: 180 //蛇头旋转方向角度
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0 //蛇头旋转方向角度
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        },
    }

}
Snake.prototype.init = function () { //初始化
    //创建蛇头
    var snakeHead = new Square(2, 0, 'snakeHead')
    snakeHead.create()
    this.head = snakeHead //存储蛇头信息
    this.pos.push([2, 0]) //把蛇头的位置存起来

    //创建蛇身体
    var snakeBody1 = new Square(1, 0, 'snakeBody')
    snakeBody1.create()
    this.pos.push([1, 0])

    var snakeBody2 = new Square(0, 0, 'snakeBody')
    snakeBody2.create()
    this.tail = snakeBody2 //存储蛇尾
    this.pos.push([0, 0])

    //形成链表关系
    snakeHead.last = null
    snakeHead.next = snakeBody1

    snakeBody1.last = snakeHead
    snakeBody1.next = snakeBody2

    snakeBody2.last = snakeBody1
    snakeBody2.next = null

    //给蛇添加方向
    this.direction = this.directionNum.right //默认方向

}

//这个方法用来获取蛇头的下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPos = function () {
    var nextPos = [ //蛇头要走的下一个点的坐标
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y
    ]

    //下个点是自己，撞到了自己的身体，game over
    var selfCollied = false //默认不是撞到自己
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true
        }
    })
    if (selfCollied) {
        this.strategies.die.call(this)
        return
    }

    //下个点墙，gameover
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        this.strategies.die.call(this)
        return
    }

    //苹果
    if (food && food.pos[0] == nextPos[0] & food.pos[1] == nextPos[1]) {
        this.strategies.eat.call(this)
        return
    }

    //下个点无
    this.strategies.move.call(this)



}

//处理碰撞后要做的事
Snake.prototype.strategies = {
    move: function (format) { //这个参数用于觉得删不删出蛇尾
        //创建一个新身体，在旧蛇头的位置
        var newBody = new Square(this.head.x / sw, this.head.y / sh, 'snakeBody')
        //更新链表的关系
        newBody.next = this.head.next
        newBody.next.last = newBody
        newBody.last = null
        this.head.remove() //删除旧蛇头
        newBody.create()

        //创建新蛇头 nextPos
        var newHead = new Square(this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y, 'snakeHead')
        //更新链表的关系
        newHead.next = newBody
        newHead.last = null
        newBody.last = newHead
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
        newHead.create()

        //更新蛇身上每一个方块的坐标
        this.pos.unshift([this.head.x / sw + this.direction.x, this.head.y / sh + this.direction.y])
        this.head = newHead

        if (!format) { //format为false，表示删除 
            this.tail.remove()
            this.tail = this.tail.last
            this.pos.pop()
        }




    },
    eat: function () {
        this.strategies.move.call(this, true)
        createFood()
        game.score++
    },
    die: function () {
        game.over()
    }
}


snake = new Snake()


//创建食物
function createFood() {
    //食物方块的随机坐标
    var x = null,
        y = null

    var include = true //true 表示食物坐标在蛇身上

    while (include) {
        x = Math.round(Math.random() * (td - 1))
        y = Math.round(Math.random() * (tr - 1))
        snake.pos.forEach(value => {
            if (value[0] != x && value[1] != y) {
                include = false
            }
        });
    }
    food = new Square(x, y, 'snakeFood')
    food.pos = [x, y] //存储生成食物的坐标，用于跟蛇头要走的下一步做对比

    var foodDom = document.querySelector('.snakeFood')
    if (foodDom) {
        foodDom.style.left = x * sw + 'px'
        foodDom.style.top = y * sh + 'px'
    } else {
        food.create()
    }


}


//创建游戏逻辑
function Game() {
    this.timer = null
    this.score = 0
}
Game.prototype.init = function () {
    snake.init()
    //snake.getNextPos()
    createFood()

    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {

            snake.direction = snake.directionNum.left
        }
        if (ev.which == 38 && snake.direction != snake.directionNum.down) {

            snake.direction = snake.directionNum.up
        }
        if (ev.which == 39 && snake.direction != snake.directionNum.left) {

            snake.direction = snake.directionNum.right
        }
        if (ev.which == 40 && snake.direction != snake.directionNum.up) {

            snake.direction = snake.directionNum.down
        }
    }
    this.start()
}
Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos()
    }, 200);
}
Game.prototype.pause = function(){
    clearInterval(this.timer)
}
Game.prototype.over = function () {
    clearInterval(this.timer)
    alert('你的得分为:' + this.score)

    //游戏回到初始状态
    var snakeWrap = document.getElementById('snakeWrap')
    snakeWrap.innerHTML = ''
    snake = new Snake()
    game = new Game()

    var startBtnWrap = document.querySelector('.startBtn')
    startBtnWrap.style.display = 'block'

}


//开启游戏
game = new Game()
var startBtn = document.querySelector('.startBtn button')
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none'
    game.init()
}

//暂停游戏
var snakeWrap = document.getElementById('snakeWrap')
var pauseBtn = document.querySelector('.pauseBtn button')
snakeWrap.onclick = function(){
    game.pause()
    pauseBtn.parentNode.style.display = 'block'
}
pauseBtn.onclick = function(){
    game.start()
    pauseBtn.parentNode.style.display = 'none'
}
