import { _decorator, Component, Label, Node } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('BombUI')
export class BombUI extends Component {

    @property(Label)
    numberLabel:Label = null;

    start() {
        // 注册一个事件
        GameManager.getInstance().node.on("onBombChange", this.onBombChange, this);
    }

    update(deltaTime: number) {
        
    }

    onBombChange() {
        this.numberLabel.string = GameManager.getInstance().GetBombNumber().toString();
    }
}


