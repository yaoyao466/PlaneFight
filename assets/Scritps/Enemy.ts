import { _decorator, Animation, Collider2D, Contact2DType, IPhysics2DContact, Component, Node, Sprite, AudioClip } from 'cc';
import { Bullet } from './Bullet';
import { GameManager } from './GameManager';
import { EnemyManager } from './EnemyManager';
import { AudioMgr } from './audioMgr';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {

    //@property
    speed:number = 0;

    @property(Animation)
    anim:Animation = null;

    @property
    animHit:string = "";
    @property
    animDown:string = "";
    @property
    hp:number = 1;
    @property
    score:number = 10;
    @property(AudioClip)
    enemyDownAudio:AudioClip = null;
    
    collider:Collider2D = null;

    start() {
        // 注册单个碰撞体的回调函数
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }

    }

    update(deltaTime: number) {
        if (this.hp > 0) {
            const p = this.node.position;
            this.node.setPosition(p.x, p.y - this.speed * deltaTime, p.z);
        }

        if (this.node.position.y < -580) {
            this.node.destroy();
        }
    }

    changeSpeed(speed: number) {
        this.speed = speed;
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        
        // 如果碰撞物体是子弹，就禁用子弹的碰撞开关
        if (otherCollider.getComponent(Bullet)) {
            // 直接销毁子弹会报错，这里采用关闭碰撞检测和不现实组件的方式，子弹会延迟到屏幕外销毁
            otherCollider.enabled = false;
            otherCollider.getComponent(Sprite).enabled = false;
        }
        
        this.hp -= 1;
        // 播放动画
        if (this.hp > 0) {
            this.anim.play(this.animHit);
        } else {
            this.anim.play(this.animDown);
        }
        
        if (this.hp <= 0) {
            this.dead();
        }
    }

    protected onDestroy(): void {
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        EnemyManager.getInstance().removeEnemy(this.node);
    }

    haveDead:boolean = false;

    dead() {
        if (this.haveDead) return;

        AudioMgr.inst.playOneShot(this.enemyDownAudio, 1);
        GameManager.getInstance().addScore(this.score);
        if (this.collider) {
            this.collider.enabled = false;
        }

        this.scheduleOnce(function() {
            this.node.destroy();
        }, 1);
        this.haveDead = true;
    }

    killNow() {
        if (this.hp <= 0) return;
        this.hp = 0;
        this.dead();
        this.anim.play(this.animDown);
    }
}


