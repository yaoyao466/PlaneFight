import { _decorator, Component, EventTouch, Input, input, Vec3, Node, Prefab, instantiate, SH, Collider, Collider2D, Contact2DType, IPhysics2DContact, Animation, Sprite, Game, AudioClip } from 'cc';
import { Reward, RewardType } from './Reward';
import { GameManager } from './GameManager';
import { LifeCountUI } from './UI/LifeCountUI';
import { AudioMgr } from './audioMgr';
const { ccclass, property } = _decorator;

enum ShootType {
    None,
    OneShoot,
    TwoShoot
};

@ccclass('Player')
export class Player extends Component {
    @property
    shootRate:number = 0.5; // 射击频率
    @property(Node)
    bulletParent:Node = null; // 子弹父节点
    @property(Prefab)
    bullet1Prefab:Prefab = null; // 子弹1对象
    @property(Node)
    Position1:Node = null; // 子弹初始位置

    @property(Prefab)
    bullet2Prefab:Prefab = null; // 子弹对象
    @property(Node)
    Position2:Node = null; // 子弹2初始位置
    @property(Node)
    Position3:Node = null; // 子弹3初始位置

    shootTimer:number = 0; // 射击时间

    @property
    shootType:ShootType = ShootType.OneShoot; // 发射模式

    @property
    lifeCount:number = 3; // 主角飞机生命

    @property(LifeCountUI)
    lifCountUI:LifeCountUI = null; // 生命值UI

    @property(AudioClip)
    bulletAudio:AudioClip = null;
    @property(AudioClip)
    getBombAudio:AudioClip = null;
    @property(AudioClip)
    getDoubleAudio:AudioClip = null;
    @property(AudioClip)
    playerContact:AudioClip = null; // 主角被撞

    @property(Animation)
    anim:Animation = null; // 主角飞机动画
    @property
    animHit:string = "";
    @property
    animDown:string = "";

    @property
    twoShootTime:number = 10; // 双发模式持续时间
    twoShootTimer:number = 0; // 双发模式定时器

    @property
    invincibleTime:number = 1; // 无敌时间
    isInvincible:boolean = false;
    invincibleTimer:number = 0; // 无敌的计时器

    collider:Collider2D = null; // 碰撞器

    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

        // 注册单个碰撞体的回调函数
        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // 销毁碰撞回调
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected start(): void {
        this.lifCountUI.updateUI(this.lifeCount);
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const reward = otherCollider.getComponent(Reward);
        if (reward) {
            this.onContactToReward(reward);
        } else {
            this.onContactToEnemy();
        }
    }

    transitionToTwoShoot() {
        this.shootType = ShootType.TwoShoot;
        this.twoShootTimer = 0;
    }

    transitionToOneShoot() {
        this.shootType = ShootType.OneShoot;
    }

    lastReward:Reward = null; // 记录上一次的奖励对象
    onContactToReward(reward:Reward) {
        if (reward == this.lastReward) {
            // 重复碰撞的奖励直接返回
            return;
        }
        this.lastReward = reward;

        switch(reward.rewardType) {
            case RewardType.TwoShoot:
                AudioMgr.inst.playOneShot(this.getDoubleAudio);
                this.transitionToTwoShoot();
                break;
            case RewardType.Bomb:
                AudioMgr.inst.playOneShot(this.getBombAudio);
                GameManager.getInstance().AddBomb();
                break;
        }

        reward.getComponent(Collider2D).enabled = false;
        reward.getComponent(Sprite).enabled = false;
    }

    onContactToEnemy() {
        if (this.isInvincible) return;

        AudioMgr.inst.playOneShot(this.playerContact, 10)
        this.isInvincible = true;
        this.invincibleTimer = 0;
        this.changeLifCount(-1);
        // 播放受伤或坠机动画
        if (this.lifeCount > 0) {
            this.anim.play(this.animHit);
        } else {
            this.anim.play(this.animDown);
        }
        // 无生命值关闭碰撞，游戏结束
        if (this.lifeCount <= 0) {
            this.shootType = ShootType.None;
            if (this.collider) {
                this.collider.enabled = false;
            }

            this.scheduleOnce(()=>{
                GameManager.getInstance().gameOver();
            }, 0.4);
        }
    }

    changeLifCount(count:number) {
        this.lifeCount += count;
        this.lifCountUI.updateUI(this.lifeCount);
    }

    onTouchMove(event:EventTouch) {
        if (GameManager.getInstance().getIsGamePause() == true) return;
        if (this.lifeCount < 1) return;

        // 记录当前坐标
        const p = this.node.position;

        // 创建新的坐标对象，用于后面传参
        let targetPostion=new Vec3(p.x + event.getDeltaX(), p.y + event.getDeltaY(), p.z);

        // 判断移动后是否超出边界
        if (targetPostion.x < -230) {
            targetPostion.x = -230;
        }
        if (targetPostion.x > 230) {
            targetPostion.x = 230;
        }
        if (targetPostion.y < -470) {
            targetPostion.y = -470;
        }
        if (targetPostion.y > 470) {
            targetPostion.y = 470;
        }
        this.node.setPosition(targetPostion);
    }

    protected update(dt: number): void {
        switch(this.shootType) {
            case ShootType.OneShoot:
                this.oneShoot(dt);
                break;
            case ShootType.TwoShoot:
                this.twoShoot(dt);
                break;
        }
        // 判断无敌时间是否
        if (this.isInvincible) {
            this.invincibleTimer += dt;
            if (this.invincibleTimer > this.invincibleTime) {
                this.isInvincible = false;
            }
        }
    }

    oneShoot(dt: number) {
        this.shootTimer += dt;
        // 更新间隔超过了射击频率，就发射子弹
        if (this.shootTimer >= this.shootRate) {
            // 播放子弹音效
            AudioMgr.inst.playOneShot(this.bulletAudio, 0.6);
            this.shootTimer = 0;
            // 创建新子弹
            const bullet1 = instantiate(this.bullet1Prefab);
            // 把子弹添加到父节点
            this.bulletParent.addChild(bullet1);
            // 给子弹赋世界坐标
            bullet1.setWorldPosition(this.Position1.worldPosition);
        }
    }
    twoShoot(dt: number) {
        // 双发模式检测与切换
        this.twoShootTimer += dt;
        if (this.twoShootTimer > this.twoShootTime) {
            this.transitionToOneShoot();
        }

        // 定时发射子弹功能
        this.shootTimer += dt;
        // 更新间隔超过了射击频率，就发射子弹
        if (this.shootTimer >= this.shootRate) {
            AudioMgr.inst.playOneShot(this.bulletAudio, 1);
            this.shootTimer = 0;
            // 创建新子弹
            const bullet1 = instantiate(this.bullet2Prefab);
            const bullet2 = instantiate(this.bullet2Prefab);
            // 把子弹添加到父节点
            this.bulletParent.addChild(bullet1);
            this.bulletParent.addChild(bullet2);
            // 给子弹赋世界坐标
            bullet1.setWorldPosition(this.Position2.worldPosition);
            bullet2.setWorldPosition(this.Position3.worldPosition);
        }
    }
}


