console.log('Load GameSprite start');
// 服务中心
// 维护各种单例服务，通过服务id,触发服务
class ServiceCenter{
	constructor(){
		this._services = new Map();
	}
	destroy(){
		for(let [id, service] of this._services.entries()){
			service.destroy();
		}
		this._services.clear();
		delete this._services;
	}
	addService(id, service){
		if(!this._services.has(id)){
			this._services.set(id, service);
		}
	}
	getService(id){
		if(!this._services.has(id)){
			//TODO: ERROR
			return null;
		}
		return this._services.get(id);
	}
	/*
	 * 服务定位/路由
	 *key=<serviceid>.<eventRote>
	 *params=object
	 *eg:
	 doServie('log.debug',['111','2222'])
	 >> LogService.debug(['111','22222'])
	 */
	doService(key, params){
		let keys = key.split('.');
		let id = keys[0];
		let service = this.getService(id);
		if(service){
			service.onService(key, params);
		}
	}
}
// 服务基类
class BaseService{
	constructor(name){
		this._name = name;
		this._servTypes = new Map();
	}
	getName(){return this._name;}
	registerSubService(type, callback){
		if(!this._servTypes.has(type)){
			this._servTypes.set(type, callback);
		}
	}
	onService(key, params){
		let keys = key.split('.');
		if(keys.length >= 2){
			let type = keys[1];
			if(type && this._servTypes.has(type)){
				this._servTypes.get(type)(params);
			}
		}
	}
}
// 日志服务
class LogService extends BaseService{
	constructor(name){
		super(name);
		this.TAG = 'GS.LogCenter';
		this.registerSubService('debug', (params)=>this.debug(params));
		this.registerSubService('warn', (params)=>this.warn(params));
		this.registerSubService('error', (params)=>this.error(params));
	}
	debug(infos){
		this.print('D', infos);
	}
	warn(infos){
		this.print('W', infos);
	}
	error(infos){
		this.print('E', infos);
	}
	print(level, infos){
		//console.log(`【${level}】`, moment().format("YY-MM-DD HH:mm:ss ms"), infos.join(' '));
		console.log(`【${level}】`, `【${moment().format("HH:mm:ss ms")}】`, infos.join(' '));
	}
}
// 事件服务
class EventService extends BaseService {
	constructor(name){
		super(name);
		this.TAG = 'GS.EvnetService';
		this.registerSubService('listen', params=>this.listen(params));
		this.registerSubService('trigger', params=>this.trigger(params));
		this.registerSubService('ignore', params=>this.ignore(params));
		this.registerSubService('ignoreAll', params=>this.ignoreAll(params));
		this.registerSubService('ignoreScope', params=>this.ignoreScope(params));
	}
	listen({eventName, target, callback}){}
	trigger({eventName, params}){}
	ignore({eventName, target}){}
	ignoreScope(target){}
}

// 组件展示，实现新的组件没必要通过继承的方式,渲染除外
class Component{
	constructor(){
		this._serviceCenter = GS.ServiceCenter;
	}
	update(gameObj){}
	destroy(){}
	//event.<listen/ignore/ignoreAll/trigger>.eventName params
	event(key, params){
		let _key = 'event.';
		_key += key;
		this._serviceCenter.doService(key, params);
	}
	listen({eventName, target, callback}){
		this.event('listen',{eventName, target, callback});
	}
	trigger({eventName, params}){
		this.event('trigger',{eventName, params});
	}
	ignore({eventName, target}){
		this.event('ignore',{eventName, target});
	}
	ignoreScope(target){
		this.event('ignoreScope',target);
	}
	//log.<debug/warn/error> params
	log(key, params){
		let _key = 'log.';
		_key += key;
		let _params = [this.TAG, ...params];
		this._serviceCenter.doService(_key, _params);
	}
	debug(...params){
		let key = 'debug';
		this.log(key, params);
	}
	warn(...params){
		let key = 'warn';
		this.log(key, params);
	}
	error(...params){
		let key = 'error';
		this.log(key, params);
	}
}
// 所有渲染相关的Component与这个关联
class ComponentRenderRoot extends Component{
	constructor(renderRoot){
		super();
		this.TAG= 'GS.ComponentRenderRoot';
		this._isScene = !renderRoot;
		this._parent = GS.Engine._app.stage;
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.scale = {x:1, y:1};
		this.anchor = {x:0.5, y:0.5};
		this.root = new PIXI.Container();
		this._parent.addChild(this.root);
	}
	update(gameObj){
		super.update(gameObj);
		this.refreshRender();
	}

	destroy(){
		super.destroy();
		this.root.removeAllChildren();
		this._parent.removeChild(this.root);
	}
	refreshRender(){
		this.root.x = this.x;
		this.root.y = this.y;
		this.root.width = this.width;
		this.root.height = this.height;
		this.root.scale.x = this.scale.x;
		this.root.scale.y = this.scale.y;
		//TODO: pixi.Container 没有anchor属性
		//this.root.anchor.set(0.5);
		//this.root.anchor.x = this.anchor.x;
		//this.root.anchor.y = this.anchor.y;
	}
	getInfo(){
		return { x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			scale: this.scale,
			anchor: this.anchor };
	}
	isScene(){return this._isScene;}
	getChildren(){return this.root.children;}
	getChild(child){return this.root.getChild(child);}
	removeChild(child){
		this.root.removeChild(child);
	}
}
// 精灵组件，渲染一张图片
class SpriteComponent extends ComponentRenderRoot{
	constructor(imgPath, renderRoot){
		super(renderRoot);
		this.TAG = 'GS.SpriteComponent';
		this._sprite = PIXI.Sprite.fromImage(imgPath);
		this.root.addChild(this._sprite);
	}
	update(gameObj){
		super.update(gameObj);
	}
	destroy(){
		super.destroy();
	}
	// 修改渲染属性，update中自动调用
	refreshRender(){
		super.refreshRender();
	}
}
class GameObject{
	constructor(){
		this.TAG = 'GS.GameObject';
		// 基本信息
		this._active = false;
		// 组件列表
		this._components = [];
		this._renderComponents = [];
		this._engine = GS.Engine;
		this._serviceCenter = GS.ServiceCenter;

		this._isRenderObject = false;
		this._renderRootCMP = null;
	}
	addComponent(cmp){
		this._components.push(cmp);
	}
	// 有渲染组件的，需要先调用这个方法，添加RenderRoot
	addRenderRoot(cmp){
		if(this._isRenderObject || this._renderRootCMP || this._renderComponents.length > 0){
			return;
		}
		if(!cmp){
			cmp = new ComponentRenderRoot();
		}
		this._renderRootCMP = cmp;
		this._isRenderObject = true;
		this._renderComponents.push(cmp);
	}
	getRenderRoot(){return this._renderRootCMP;}
	getRenderRootInfo(){
		return this._renderRoot.getInfo();
	}
	addRenderComponent(cmp){
		if(!this._isRenderObject){
			//TODO: log error
			console.error('This is not a render object.');
			return;
		}
		this._renderComponents.push(cmp);
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
		if(this._isRenderObject){
			for(let i = 0; i < this._renderComponents.length; ++i){
				this._renderComponents[i].update(this);
			}
		}
	}
	//event.<listen/ignore/ignoreAll/trigger>.eventName params
	event(key, params){
		let _key = 'event.';
		_key += key;
		this._serviceCenter.doService(key, params);
	}
	listen({eventName, target, callback}){
		this.event('listen',{eventName, target, callback});
	}
	trigger({eventName, params}){
		this.event('trigger',{eventName, params});
	}
	ignore({eventName, target}){
		this.event('ignore',{eventName, target});
	}
	ignoreScope(target){
		this.event('ignoreScope',target);
	}
	//log.<debug/warn/error> params
	log(key, params){
		let _key = 'log.';
		_key += key;
		let _params = [this.TAG, ...params];
		this._serviceCenter.doService(_key, _params);
	}
	debug(...params){
		let key = 'debug';
		this.log(key, params);
	}
	warn(...params){
		let key = 'warn';
		this.log(key, params);
	}
	error(...params){
		let key = 'error';
		this.log(key, params);
	}
}

class Engine{
	constructor(){
		this.TAG = 'GS.EventCenter';
		this._size = {width: 800, height: 600};
		this._bgColor = 0x1099bb;
		this._FPS = 0;
		this._gameObjects = [];
		this._config = {
			width: 800,
			height: 600,
			bgColor: 0xff0000,
		};
	}
	init(){
		this._app = new PIXI.Application(this._config.width, this._config.height, this._config.bgColor);
		document.body.appendChild(this._app.view);
	}
	setConfig(config){
		this._config = config;
		this._size = {width: this._config.width, height: this._config.height}
		this._bgColor = this._config.bgColor;
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
	}
	update(delay){
		for(let i = 0; i < this._gameObjects.length; ++i){
			this._gameObjects[i].update(delay);
		}
	}
}

let GS = {};
GS.Component = Component;
GS.ComponentSprite = SpriteComponent;
GS.ComponentRenderRoot = ComponentRenderRoot;
GS.GameObject = GameObject;
GS.Event = Event;

GS.initGameSprite = (conf)=>{
	GS.Engine = new Engine();
	GS.Engine.setConfig(conf);
	// Service
	GS.ServiceCenter = new ServiceCenter();
	GS.ServiceCenter.addService('log', new LogService('log'));
	GS.ServiceCenter.addService('event', new EventService('event'));
}
if(!(typeof exports === 'undefined')) {
    exports.GS = GS;
}
console.log('Load GameSprite end');
