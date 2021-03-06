// namespace:
this.argunet = this.argunet||{};

argunet.ArgunetBrowserView = function(htmlElement, width, height, browserId){
	this.canvasView= undefined;
	
	var cWidth = width || 640;
	var cHeight = height || 385;

	//canvas
	if (typeof(htmlElement)=="string") { htmlElement = $(htmlElement);}
	$(htmlElement).append("<div class='argunetBrowser loading' width='"+cWidth+"' height='"+cHeight+"'><canvas width='"+cWidth+"' height='"+cHeight+"'></canvas></div>");
	this.canvas = $(htmlElement).children(".argunetBrowser").children("canvas").get(0);
	
	//createjs stage
	this.stage = new createjs.Stage(this.canvas);
	this.stage.mouseEventsEnabled = true;
	this.stage.enableMouseOver(20);
	
	//check if touch is supported and enable it
	if(createjs.Touch.isSupported())createjs.Touch.enable(this.stage);
	
	//Navigation Bar
	this.navigationBar = new argunet.NavigationBarView($(this.canvas).parent());
	this.navigationOpened = false;
	
	//Debate List
	this.debateListView = new argunet.DebateListView($(this.canvas).parent(),browserId);
	this.debateListView.setHeight($(this.canvas).parent().height()-this.navigationBar.height);

	
	//Tooltip
	var tooltipLayer= new createjs.Container();
	this.stage.addChild(tooltipLayer);
	
	this.tooltip = new argunet.TooltipCanvasView(this.canvas);
	//tooltipLayer.addChild(tooltip);
	this.stage.addChild(this.tooltip);

};
argunet.ArgunetBrowserView.prototype.handleEvent = function(evt){
	var that = this;
	if(evt.type == "showTooltip" && !this.navigationOpened){
    	this.tooltipTimeout = window.setTimeout( function(){
    		that.tooltip.setVisible(true);
    		that.tooltip.x = that.stage.mouseX+5;
    		that.tooltip.y = that.stage.mouseY+5;
    		that.tooltip.setContent(evt.tooltip);
    		that.stage.update();
    		window.clearTimeout(this.tooltipTimeout);
    	}, 1000 );
		
	}else if(evt.type == "hideTooltip" && !this.mouseOverTooltip){
			window.clearTimeout(this.tooltipTimeout);
			this.tooltip.setVisible(false);
			this.stage.update();
	}else if(evt.type == "mousedown"){
		if(!this.mouseOverTooltip){
			window.clearTimeout(this.tooltipTimeout);
			this.tooltip.setVisible(false);
			this.stage.update();
		}
	}else if(evt.type == "mouseover" && evt.target == this.tooltip){
		this.mouseOverTooltip = true;
	}else if(evt.type == "mouseout" && evt.target == this.tooltip){
		this.mouseOverTooltip = false;
		this.tooltip.setVisible(false);
		this.stage.update();		
	}else if(evt.type == "stagemousemove"){
		if(this.stage.mouseY > this.canvas.height - this.navigationBar.height){
			if(!this.navigationOpened){
				this.navigationBar.show();
				this.navigationOpened = true;
			}
		}else{
			if(this.navigationOpened && !this.debateListView.isOpen){
				this.navigationBar.hide();
				this.navigationOpened = false;
			}
		}
	}
};
argunet.ArgunetBrowserView.prototype.setCanvasView = function (view){
	var that = this;
	this.stage.clear();
	this.canvasView = view;	
	this.canvasView.initialize(this.stage);
	this.tooltip.addEventListener("mouseover",this);
	this.tooltip.addEventListener("mouseout",this);
	
	this.stage.addEventListener("stagemousemove",this);
	this.navigationBar.addEventListener("openDebateList",function(){
		that.debateListView.show();
	});
	this.navigationBar.addEventListener("closeDebateList",function(){
		that.debateListView.hide();
	});	
};
argunet.ArgunetBrowserView.prototype.removeLoadingSpinner = function(){
	$(this.canvas).parent().removeClass("loading");
};
