import { _decorator, Component, director, Node } from 'cc';
import { AudioMgr } from './audioMgr';
const { ccclass, property } = _decorator;

@ccclass('StartUI')
export class StartUI extends Component {
    start() {
        AudioMgr.inst.stop();
    }

    update(deltaTime: number) {
        
    }

    public onStartButtonClick() {
        director.loadScene("02-GameScene")
    }
}


