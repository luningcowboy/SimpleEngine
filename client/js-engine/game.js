console.log("Load game.js start");
class MoveComponent{
	constructor(mx, my, renderComponent){
		this._mx = mx;
		this._my = my;
		this._cmp = renderComponent;
	}
	update(obj){
		obj.debug('MoveComponent','update');
		this._cmp.x += this._mx;
		this._cmp.y += this._my;
	}
}
class GameObjectBG extends GS.GameObject {
	constructor() {
		super();
		this.x = 100;
		this.y = 100;
		this.width = 100;
		this.height = 100;
		this.addRenderRoot();
		let sp = new GS.SpriteComponent('./images/b1.png', this.getRenderRoot())
		this.addRenderComponent(sp);
		this.addComponent(new MoveComponent(1, 1, sp));
	}
}
// 开始游戏逻辑
let bg = new GameObjectBG();
bg.active();
console.log("Load game.js end");
