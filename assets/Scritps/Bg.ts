import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bg')
export class Bg extends Component {

    @property(Node)
    bg01:Node = null
    @property(Node)
    bg02:Node = null
    @property
    speed:number = 100;

    hight:number = 1080; // 屏幕高度
    start() {

    }

    update(deltaTime: number) {
        let position1 = this.bg01.position;
        this.bg01.setPosition(position1.x, position1.y - this.speed * deltaTime, position1.z)
        let position2 = this.bg02.position;
        this.bg02.setPosition(position2.x, position2.y - this.speed * deltaTime, position2.z)
        
        //实现背景循环滚动
        //记录两张背景的位置
        let p1 = this.bg01.position;
        let p2 = this.bg02.position;
        //当背景1位置超出屏幕范围时，把它的位置放到上面
        if (this.bg01.position.y < (-1 * this.hight)) {
            this.bg01.setPosition(p1.x, p2.y + this.hight, p1.z)
        }
        //当背景2位置超出屏幕范围时，把它的位置放到上面
        if (this.bg02.position.y < (-1 * this.hight)) {
            this.bg02.setPosition(p2.x, p1.y + this.hight, p2.z)
        }
    }
}


