import { _decorator, AudioClip, AudioSource, Component, Game, Input, input, instantiate, math, Node, Prefab } from 'cc';
import { GameManager } from './GameManager';
import { Enemy } from './Enemy';
import { AudioMgr } from './audioMgr';
const { ccclass, property } = _decorator;

@ccclass('EnemyManager')
export class EnemyManager extends Component {

    private static instance:EnemyManager = null;

    public static getInstance():EnemyManager {
        return this.instance;
    }

    @property
    enemy0SpawnRate:number = 1;
    @property(Prefab)
    enemy0Prefab:Prefab = null;
    @property
    enemy1SpawnRate:number = 3;
    @property(Prefab)
    enemy1Prefab:Prefab = null;
    @property
    enemy2SpawnRate:number = 10;
    @property(Prefab)
    enemy2Prefab:Prefab = null;

    @property
    rewardSpawnRate:number = 15;
    @property(Prefab)
    reward1Prefab:Prefab = null;
    @property(Prefab)
    reward2Prefab:Prefab = null;
    @property([Node])
    enemyArray:Node[] = [];

    @property(AudioClip)
    useBombAudio:AudioClip = null;

    doubleClickInterval:number = 0.2;
    lastClickTime:number = 0;

    protected onLoad(): void {
        EnemyManager.instance = this;
        this.lastClickTime = 0;
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    start() {
        this.schedule(this.enemy0Spawn, this.enemy0SpawnRate);
        this.schedule(this.enemy1Spawn, this.enemy1SpawnRate);
        this.schedule(this.enemy2Spawn, this.enemy2SpawnRate);
        this.schedule(this.rewardspawn, this.rewardSpawnRate);
    }

    update(deltaTime: number) {
        
    }

    protected onDestroy(): void {
        this.unschedule(this.enemy0Spawn);
        this.unschedule(this.enemy1Spawn);
        this.unschedule(this.enemy2Spawn);
    }

    enemy0Spawn() {
        const enemyNode = this.objectSpawn(this.enemy0Prefab, -215, 215, 450);
        this.enemyArray.push(enemyNode);
    }

    enemy1Spawn() {
        const enemyNode = this.objectSpawn(this.enemy1Prefab, -200, 200, 475);
        this.enemyArray.push(enemyNode);
    }

    enemy2Spawn() {
        const enemyNode = this.objectSpawn(this.enemy2Prefab, -155, 155, 560);
        this.enemyArray.push(enemyNode);
    }

    rewardspawn() {
        const randomNumber = math.randomRangeInt(0, 2);
        let prefab = null;
        if (randomNumber == 0) {
            prefab = this.reward1Prefab;
        } else {
            prefab = this.reward2Prefab;
        }
        this.objectSpawn(prefab, -207, 207, 474);
    }
    
    objectSpawn(objPrefab:Prefab, minX: number, maxX: number, Y: number):Node {
        const obj = instantiate(objPrefab);
        this.node.addChild(obj);
        // 范围内随机生成X坐标
        const randomX = math.randomRangeInt(minX, maxX);
        obj.setPosition(randomX, Y, 0);
        return obj;
    }

    onTouchEnd(event) {
        let currentTime = Date.now();
        let timeDiff = (currentTime - this.lastClickTime) / 1000; // 转换为秒

        if (timeDiff < this.doubleClickInterval) {
            this.onDoubleClick(event);
        }

        this.lastClickTime = currentTime;
    }

    onDoubleClick(event) {
        // 双击执行的操作
        if (GameManager.getInstance().isHaveBomb() === false) return;

        GameManager.getInstance().useBomb();
        AudioMgr.inst.playOneShot(this.useBombAudio, 0.3);

        for (let node of this.enemyArray) {
            const enemy = node.getComponent(Enemy);
            enemy.killNow();
        }
    }

    pauseEnemyAudio() {
        // 暂停所有敌机的音频
        let audioSources = this.node.getComponentsInChildren(AudioSource);
        audioSources.forEach((audio) => {
            if (audio && audio.playing) {
                audio.pause();
            }
        });
    }

    resumeEnemyAudio() {
        let audioSources = this.node.getComponentsInChildren(AudioSource);
        audioSources.forEach((audio) => {
            if (audio && !audio.playing) {
                audio.play();
            }
        });
    }

    removeEnemy(n:Node) {
        const index = this.enemyArray.indexOf(n);
        if (index !== -1) {
            this.enemyArray.splice(index, 1);
        }
    }

}


