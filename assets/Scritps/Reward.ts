import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;

export enum RewardType {
    TwoShoot,
    Bomb
}


@ccclass('Reward')
export class Reward extends Component {

    @property({type:Enum(RewardType)})
    rewardType:RewardType = RewardType.TwoShoot;

    @property
    speed:number = 90;

    update(deltaTime: number) {
        const p = this.node.position;
        this.node.setPosition(p.x, p.y - this.speed * deltaTime, p.z);
        
        if (this.node.position.y < -580) {
            this.node.destroy();
        }
    }
}


