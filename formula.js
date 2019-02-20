var set = function(id, val) {
	var f = variables.find(function(d){return d.id === id})
	if(f) f.value = val;
	return (f != undefined)
}

var get = function(id) {
	var f = variables.find(function(d){return d.id === id})
	if(f) return f.value;
	return f;
}

var inc = function(id) {
	var f = variables.find(function(d){return d.id === id})
	if(f){
		max = ((f.max instanceof Function)? f.max() : parseFloat(f.max));
		incr = f.inc || 1.0;
		incr = parseFloat(incr);
		min = ((f.min instanceof Function)? f.min() : parseFloat(f.min));
		prec = f.prec || 5;
		val = parseFloat(f.value);

		val += incr;
		val = Math.round(val * Math.pow(10,prec)) / Math.pow(10,prec);

		if (!isNaN(max) && !isNaN(min) && val > max) val = min;
		else if (!isNaN(max) && val > max) val -= incr;

		f.value = val;
	}
	return (f != undefined)
}

var dec = function(id) {
	var f = variables.find(function(d){return d.id === id})
	if(f){
		max = ((f.max instanceof Function)? f.max() : parseFloat(f.max));
		incr = f.inc || 1.0;
		incr = parseFloat(incr);
		min = ((f.min instanceof Function)? f.min() : parseFloat(f.min));
		prec = f.prec || 5;
		val = parseFloat(f.value);

		val -= incr;
		val = Math.round(val * Math.pow(10,prec)) / Math.pow(10,prec);

		if (!isNaN(min) && !isNaN(max) &&  val < min) val = max;
		else if (!isNaN(min) && val < min) val += incr;

		f.value = val;
	}
	return (f != undefined)
}

var click = function(id) {
	var f = formulas.find(function(d){return d.id === id})
	if(f) f.click();
	return (f != undefined)
}

var rightclick = function(id) {
	var f = formulas.find(function(d){return d.id === id})
	if(f) f.rightclick();
	return (f != undefined)
}

var update = function(id) {
	var f = formulas.find(function(d){return d.id === id})
	if(f) f.update();
	return (f != undefined)
}

var stopgo = function(id) {
	var t = timers.find(function(d){return d.id === id})
	if(t) t.active = !t.active;
	return (t != undefined)
}

var stop = function(id) {
	var t = timers.find(function(d){return d.id === id})
	if(t && t.active) t.active = false;
	return (t != undefined)
}

var go = function(id) {
	var t = timers.find(function(d){return d.id === id})
	if(t) t.active = true;
	return (t != undefined)
}

var step = function(id) {
	var t = timers.find(function(d){return d.id === id})
	if(t) t.execute();
	return this.parent;
}

var jump = function(id, steps) {
	var t = timers.find(function(d){return d.id === id})
	for(i = 0; i < steps; ++i)
		t.execute();
	return this.parent;
}

var run_timer = function(id) {
	var t = timers.find(function(d){return d.id === id})
	setTimeout(function() {
		var t = timers.find(function(d){return d.id === id})
		var f = formulas.find(function(d){return d.id === id})
		if(t.active) {
			t.execute();	
		}
		run_timer(id);
	}, t.inc * 1000)
}

variables = [];
formulas = [];
timers = [];

d3.selectAll("formula").selectAll("var").each(function() {
	var me = d3.select(this);
	var that = this;
	var v = {
		id: me.attr("id"),
		value: eval(me.text())
	}
	if(me.attr("within")) {			// variables with "within" attributes
		arr = me.attr("within");	// are array indices
		v.min = 0;
		v.inc = 1;
		v.max = function() { return get(arr).length - 1; };
	}
	if(me.attr("min")) v.min = me.attr("min");
	if(me.attr("max")) v.max = me.attr("max");
	if(me.attr("inc")) v.inc = me.attr("inc");
	if(me.attr("prec")) v.prec = me.attr("prec");
	var f = variables.find(function(d){return d.id == that.id;})
	if(f == undefined)
		variables.push(v);

	me.remove();
})

d3.selectAll("formula").selectAll("timer").each(function() {
	var me = d3.select(this);
	var that = this;
	var t = {
		id: me.attr("id"),
		rule: me.text(),
		execute: function(){eval(this.rule)},
		active: false
	}
	if(me.attr("within")) {			// variables with "within" attributes
		arr = me.attr("within");	// are array indices
		t.min = 0;
		t.max = function() { return get(arr).length - 1; };
	}
	if(me.attr("min")) t.min = me.attr("min") || 0;
	if(me.attr("max")) t.max = me.attr("max");
	if(me.attr("inc")) t.inc = me.attr("inc") || 0.5;
	var f = timers.find(function(d){return d.id == that.id;})
	if(f == undefined)
		timers.push(t);

	run_timer(t.id);

	me.remove();
})

var formula = function(me) {
	var that = this;
	this.me = me;
	this.id = me.attr("id");
	this.style = me.attr("style");

	this.clickable = false;

	me.selectAll("rule").each(function(){
		var t = d3.select(this).attr("type");
		if(t == "click" || t == "rightclick" || t == "doubleclick")
			that.clickable = true;
	})

	if(this.clickable) me.classed("clickable", true);

	this.rules = [];

	me.selectAll("rule").each(function() {
		var r = d3.select(this);
		that.rules.push({
			id: r.node().parentElement.id,
			type: r.attr("type"),
			rule: r.text(),
			execute: function(){eval(this.rule)}
		})
		r.remove();
	})

	this.original = me.text();
	this.text = me.text();

	this.vars = this.original.split("$")
	this.vars.shift();
	this.vars.pop();
	this.ids = [];
	var that = this;

	for(j in this.vars) {
		if(variables.filter(function(d){ return (d.id === that.vars[j]) }).length)
			this.ids.push(this.vars[j]);
	}

	this.me.on("click", function() {
		that.interact("click")
	});
	this.me.on("contextmenu", function() {
		d3.event.preventDefault();
		that.interact("rightclick")
	});
	this.me.on("doubleclick", function() {that.interact("doubleclick")});
	that.initialize();
}

formula.prototype.directlyDepends = function(id) {
	return (this.original.includes("$" + id + "$"));
}

formula.prototype.interact = function(type) {
	for(r in this.rules)
		if(this.rules[r].type === type || this.rules[r].type === "any") this.rules[r].execute();

	this.refresh();	
}

formula.prototype.update = function() {this.interact("update");}
formula.prototype.click = function() {this.interact("click");}
formula.prototype.rightclick = function() {this.interact("rightclick");}
formula.prototype.initialize = function() {this.interact("initialize");}
formula.prototype.text = function(input) {
	

}

var clean = function(str) {
	var st
	if(!isNaN(str)){
		if(str && Math.abs(str) > 10e15)
			st = str.toExponential()
				.replace("e-", " \\times 10^{-")
				.replace("e+", " \\times 10^{") + "}";
		else
			st = str	
				.toLocaleString("en"); 
	} else st = str;

	return st;
}

formula.prototype.refresh = function() {
	var that = this;
	this.text = this.original;
	for(j in this.ids) {
		var v = variables
			.find(function(d){return (d.id === that.ids[j]);});
		var val = v.value;
		if(!isNaN(val)){
			if(val && Math.abs(val) > 10e15)
				va = val.toExponential()
					.replace("e-", " \\times 10^{-")
					.replace("e+", " \\times 10^{") + "}";
			else
				va = val
					.toLocaleString("en"); 
		} else va = val;
		this.text = this.text.replace("{$" + this.ids[j] + "$}", "{" + va + "}");
		this.text = this.text.replace("($" + this.ids[j] + "$)", "(" + va + ")");
		this.text = this.text.replace("[$" + this.ids[j] + "$]", "[" + va + "]");
		if(!isNaN(val) && val < 0) va = "(" + va + ")";
		// negative numbers not immediately enclosed in brackets are parenthesized
		this.text = this.text.replace("$" + this.ids[j] + "$", va);
	}

	this.me.node().innerHTML = this.text;
	katex.render(this.text, document.getElementById(this.me.attr("id")));
}


d3.selectAll("formula").each(function() {
	var me = d3.select(this);
	formulas.push(new formula(me));
})
