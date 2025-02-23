import { _decorator, AudioClip, Component, director, game, Node } from 'cc';
import { ScoreUI } from './UI/ScoreUI';
import { GameOverUI } from './UI/GameOverUI';
import { AudioMgr } from './audioMgr';
import { EnemyManager } from './EnemyManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    private static instance: GameManager; // 单例模式

    public static getInstance(): GameManager {
        return this.instance;
    }

    @property
    private bombNumber: number = 0; // 炸弹奖励数量
    @property
    private score:number = 0;
    @property(ScoreUI)
    scoreUI:ScoreUI = null;
    @property(Node)
    pauseButtonNode:Node = null;
    @property(Node)
    resumeButtonNode:Node = null;
    @property(GameOverUI)
    gameOverUI:GameOverUI = null;

    @property(AudioClip)
    gameMusic:AudioClip = null;
    @property(AudioClip)
    buttonAudio:AudioClip = null;
    @property(AudioClip)
    gameOverAudio = null;

    private isGamePause:boolean = false; // 游戏状态

    protected onLoad(): void {
        GameManager.instance = this;
    }

    protected start(): void {
        AudioMgr.inst.play(this.gameMusic, 0.3);
    }

    public AddBomb() {
        this.bombNumber += 1
        // 通过事件的方式更新UI
        this.node.emit("onBombChange");
    }

    public GetBombNumber():number {
        return this.bombNumber;
    }

    public addScore(s:number) {
        this.score += s;
        this.scoreUI.updateUI(this.score);
    }

    getIsGamePause():boolean {
        return this.isGamePause;
    }

    onPauseButtonClick() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 1);
        AudioMgr.inst.pause();
        EnemyManager.getInstance().pauseEnemyAudio();
        director.pause();
        //game.pause();
        
        this.pauseButtonNode.active = false;
        this.resumeButtonNode.active = true;
        this.isGamePause = true;
    }

    onResumeButtonClick() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 1);
        AudioMgr.inst.resume();
        EnemyManager.getInstance().resumeEnemyAudio();
        director.resume();
        //game.resume();
        this.pauseButtonNode.active = true;
        this.resumeButtonNode.active = false;
        this.isGamePause = false;
    }

    gameOver() {
        //this.onPauseButtonClick();
        AudioMgr.inst.playOneShot(this.gameOverAudio, 0.5);
        AudioMgr.inst.pause();
        director.pause();
        this.isGamePause = true;
        // 显示gameover ui

        let hScore = localStorage.getItem("HighestScore");
        let hScoreInt = 0;
        if (hScore !== null) {
            hScoreInt = parseInt(hScore, 10);
        }

        if (this.score > hScoreInt) {
            localStorage.setItem("HighestScore", this.score.toString());
        }

        this.gameOverUI.showGameOverUI(hScoreInt, this.score);
    }

    onRestartButtonClick() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 1);
        this.onResumeButtonClick();
        director.loadScene(director.getScene().name);
    }

    onQuitButtonClick() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 1);
        EnemyManager.getInstance().pauseEnemyAudio();
        AudioMgr.inst.stop();
        this.onResumeButtonClick();
        director.loadScene("01-Start");
    }

    isHaveBomb():boolean {
        return this.bombNumber > 0;
    }

    useBomb() {
        this.bombNumber -= 1;
        this.node.emit("onBombChange");
    }
}
