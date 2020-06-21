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

			let safe_rect = {
				w: 640, h:1040
			};
			let design_rect = {
				w: 800,h:1280
			}
			
			let on_resize = _.throttle(function () {
				// let _selfBox = document.querySelector("#app");
				let _win_wh = _.sortBy([document.body.clientWidth, document.body.clientHeight]);
				let _screen_height = _win_wh[1] / (_win_wh[0] / safe_rect.w);
				let _expect_height = _screen_height <= safe_rect.h ? safe_rect.h : _screen_height;
				self.suitHeight = -(design_rect.h - _expect_height > 0 ? design_rect.h - _expect_height : 0) / 2 + (_screen_height > design_rect.h ? (_screen_height - design_rect.h) / 2 : 0);

				self.initHeight = _expect_height;
				ems.trigger('resize');
			},0);
			window.addEventListener('resize',on_resize,false);
			on_resize();

			//单文件模式
			annie._isReleased= __version.replace('?v=','');
			annie.suffixName = '.webp';

			self.stage = new annie.Stage('app', design_rect.w, self.initHeight, 30, annie.StageScaleMode.FIXED_HEIGHT, 0);
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