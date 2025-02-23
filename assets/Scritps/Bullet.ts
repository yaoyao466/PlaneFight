import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {

    @property
    speed:number = 500;

    start() {

    }

    update(deltaTime: number) {
        const position = this.node.position;
        this.node.setPosition(position.x, position.y + this.speed * deltaTime, position.z);
        if (position.y > 550) {
            this.node.destroy();
        }
    }
}


