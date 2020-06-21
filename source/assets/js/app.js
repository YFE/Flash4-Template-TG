;(function on_init() {
	const ems = new gm.EM;

	class MyApp {
		constructor () {
			this.page = {}
			this.isInited = false;
		}
		loadStart () {
			let self = this;
			gm.mt = annie.MouseEvent;
			gm.et = annie.Event;
			let on_resize = _.throttle(function () {
				// let _selfBox = document.querySelector("#app");
				let _selfwh = _.sortBy([document.body.clientWidth, document.body.clientHeight]);
				let _screenHeight = _selfwh[1] / (_selfwh[0] / 640);
				let _desHeight = _screenHeight <= 1040 ? 1040 : _screenHeight;
				self.suitHeight = -(1280 - _desHeight > 0 ? 1280 - _desHeight : 0) / 2 + (_screenHeight > 1280 ? (_screenHeight - 1280) / 2 : 0);
				self.initHeight = _desHeight;
				ems.trigger('resize');
			},0);
			window.addEventListener('resize',on_resize,false);
			on_resize();

			//单文件模式
			annie._isReleased= __version.replace('?v=','');
			annie.suffixName = '.webp';

			self.stage = new annie.Stage('app', 800, self.initHeight, 30, annie.StageScaleMode.FIXED_HEIGHT, 0);
			self.stage.autoSteering = false;
			// self.stage.autoResize = false;

			self.stage.addEventListener(annie.Event.ON_INIT_STAGE, function on_init_stage(e) {
				annie.loadScene(['cloading'], function (per) {
					self.loadProcess(per);
				}, function (result) {
					if (result.sceneId == result.sceneTotal) {
						
						let ploading = self.page['cloading'] = gm.fla.getClass('cloading');
						ploading.y = self.suitHeight;

						ems.on('resize', _.throttle(function ems_resize(){
							self.stage.desHeight = self.initHeight;
							ploading.y = self.suitHeight;
						}, 100, {
							trailing : false
						}));

						//font handlee
						ploading.loadBox.loadText.loadNum.font = 'handlee';

						ploading.loadBox.gotoAndPlay(2);
						self.loadProcess = function (_per) {
							ploading.loadBox.loadText.loadNum.text = _per + "%";
						}
						self.loadProcess(0);
						self.stage.addChild(ploading);

						// 加载其他
						annie.loadScene(['cmain'], function (per) {
							self.loadProcess(per);
						}, function (result) {
							if (result.sceneId == result.sceneTotal) {
								self.loadProcess(100);
								self.page['cmain'] = gm.fla.getClass('cmain');
								ploading.container.addChild(self.page['cmain']);
								annie.Tween.to(ploading.loadBox,0.3,{
									alpha: 0,
									onComplete : function(){
										ploading.loadBox.visible = false;
									}
								})
								self.loadComplete();
							}
						}, __cdnurl);
					}
				}, __cdnurl);
			});
		}
		loadProcess (_per) {}
		loadComplete () {
			gm.load();
			this.init();
		}
		init  () {
			let self = this;
		}
	};
	
	var myapp = new MyApp();

	window.initAPP = function (cb) {
		if( myapp.isInited ) return;
		myapp.isInited = true;
		cb(myapp);
	}
}());