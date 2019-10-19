console.log('load gobang.js start')




// 游戏状态管理
class ComponentGameStat{
	constructor(){
		this.TAG = 'ComponentGameStat';
	}
	update(obj){
	}
	destroy(){}
}

// 游戏渲染根节点
class GobangRootRender extends GS.ComponentRenderRoot{
	constructor(){
		super();
		this.x = 400;
		this.y = 300;
		this.width = 800;
		this.height = 600;
		this._bgSprite = new PIXI.Sprite('');
		this.root.addChild(this._bgSprite);
		this._bgSprite.x = 400;
		this._bgSprite.y = 300;
		this._bgSprite.anchor.x = 0.5;
		this._bgSprite.anchor.y = 0.5;
	}
	update(obj){
		super.update(obj);
	}
	destroy(){
		super.destroy();
	}
	refreshRender(){
		super.refreshRender();
	}
}

// 游戏入口函数
class Gobang extends GS.GameObject{
	constructor() {
		super();
		this.TAG = 'Gobang';
		this.addRenderRoot(new GobangRootRender());
		this.addComponent(new ComponentGameStat());
	}
}
console.log('load gobang.js end')

let game = new Gobang();
game.active();


