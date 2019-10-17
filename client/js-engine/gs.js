console.log('Load GameSprite start');
class Component{
	constructor(){}
	update(gameObj){}
	destroy(){}
}
class SpriteComponent{
	constructor(imgPath, gameObj){
		this._gameObj = gameObj;
		this._sprite = PIXI.Sprite.fromImage(imgPath);
		this._gameObj._engine.addChild(this._sprite);
	}
	update(gameObj){
		this._sprite.x = this._gameObj.x;
		this._sprite.y = this._gameObj.y;
		this._sprite.width = this._gameObj.width;
		this._sprite.height = this._gameObj.height;
		this._sprite.scale.x = this._gameObj.scale.x;
		this._sprite.scale.y = this._gameObj.scale.y;
		this._sprite.anchor.x = this._gameObj.anchor.x;
		this._sprite.anchor.y = this._gameObj.anchor.y;
	}
	destroy(){
		this._gameObj._engine.removeChild(this._sprite);
	}
}
class GameObject{
	constructor(){
		// 基本信息
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.scale = {x:1, y:1};
		this.anchor = {x:0.5, y:0.5};
		this._active = false;
		// 组件列表
		this._components = [];
		this._engine = GS.Engine;
		this._eventCenter = GS.EventCenter;
	}
	addComponent(cmp){
		this._components.push(cmp);
	}
	active(){
		this._active = true;
		this._engine.addGameObject(this);
	}
	stop(){
		this._active = false;
		this._engine.removeGameObject(this);
	}
	destroy(){
		this._active = false;
		this._engine.removeGameObject(this);
		for(let i = 0; i < this._components.length; ++i){
			this._components[i].destroy();
		}
		this._components = [];
		this.ignoreAll();
	}
	update(delay){
		if(!this._active) return;
		for(let i = 0; i < this._components.length; ++i){
			this._components[i].update(this);
		}
	}
	listen(event, callback){
		this._eventCenter.listen(event, callback);
	}
	sendEvent(event, params){
		this._engine.addEvent(new Event(event, params));
	}
	ignore(event){}
	ignoreAll(){}
}

class Event{
	constructor(tag, params){
		this._tag = tag;
		this._params = params;
	}
	trigger(){
		GS.EventCenter.trigger(this._tag, this._params);
	}
}

class EventCenter{
	constructor(){
		this._eventMap = new Map();
	}
	trigger(eventTag, params){}
	listen(eventTag, callback){}
	ignore(eventTag, target){}
	ignoreScope(target){}
}

class Engine{
	constructor(){
		this._size = {width: 800, height: 600};
		this._bgColor = 0x1099bb;
		this._FPS = 0;
		this._gameObjects = [];
		this._evnets = [];
	}
	init(){
		this._app = new PIXI.Application(this._size, this._bgColor);
		document.body.appendChild(this._app.view);
	}
	start(){
		this.init();
		this._app.ticker.add(delay=>{this.mainLoop(delay)});
	}
	addGameObject(obj){
		this._gameObjects.push(obj);
	}
	removeGameObject(obj){
		let index = this._gameObjects.indexOf(obj);
		if(index >= 0) this._gameObjects.splice(index,1);
	}
	mainLoop(delay){
		this.update(delay);
		// 事件处理
		if(this._evnets.length > 0){
			let evnet = this._evnets.pop();
			evnet.trigger();
		}
	}
	update(delay){
		for(let i = 0; i < this._gameObjects.length; ++i){
			this._gameObjects[i].update(delay);
		}
	}
	addEvent(event){
		this._events.push(event);
	}
	addChild(child){
		this._app.stage.addChild(child);
	}
	removeChild(child){
		this._app.stage.removeChild(child);
	}
}

window.GS = {};
GS.Component = Component;
GS.SpriteComponent = SpriteComponent;
GS.GameObject = GameObject;
GS.Event = Event;

function initGameSprite(){
	GS.EventCenter = new EventCenter();
	GS.Engine = new Engine();
	GS.Engine.start();
}
initGameSprite();
console.log('Load GameSprite end');
