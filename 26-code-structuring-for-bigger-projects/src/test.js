
// これはクラス。
class Robot {
    // これは呼び出された瞬間に実行されるメソッド
    constructor(name){
        // context ここではnameをコンテキストとして保存するため。
        this.name = name
        console.log(`I am ${name}. Thank you creator.`)
        this.sayHi()
    }
    // メソッド
    sayHi(){
        console.log(`Hello! My name is ${this.name}`)
    }
}

// Robotを継承したクラス。
class FlyingRobot extends Robot{
    takeOff(){
        console.log(`Have a good flight ${this.name}`)
    }
    // 親で定義したものを子で再定義して上書きする。オーバーライド。
    sayHi(){
        console.log(`Hello! My name is ${this.name} and I am a flying robot.`)
    }
}

// インスタンス     // クラス
const wallE = new Robot("Wall-E")
const ultron = new FlyingRobot("ultron")
const astroBoy = new FlyingRobot("Astro Boy")

// メソッド
astroBoy.sayHi()
astroBoy.takeOff()