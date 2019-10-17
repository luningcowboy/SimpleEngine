console.log("Load game.js start");
class MoveComponent{
	constructor(mx, my){
		this._mx = mx;
		this._my = my;
	}
	update(obj){
		console.log('MoveComponent');
		obj.x += this._mx;
		obj.y += this._my;
	}
}
class GameObjectBG extends GS.GameObject {
	constructor() {
		super();
		this.x = 100;
		this.y = 100;
		this.width = 100;
		this.height = 100;
		this.addComponent(new GS.SpriteComponent('./images/b1.png', this));
		this.addComponent(new MoveComponent(1, 1));
	}
}
// 开始游戏逻辑
let bg = new GameObjectBG();
bg.active();
console.log("Load game.js end");
