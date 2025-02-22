import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreUI')
export class ScoreUI extends Component {

    @property(Label)
    numberLabel:Label = null;

    updateUI(score: number) {
        this.numberLabel.string = score.toString();
    }
}


