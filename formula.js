function to_frac(n, prec, b) {
	if(!prec) prec = 2;
	var num = 1;
	var den = b || 1;
	if(Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec) % 1 == 0)
		return Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec)

	if(b != undefined && b > 0) {
		while
		(Math.floor((num/den) * Math.pow(10, prec))/Math.pow(10,prec) <
		Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec))
			num++;
		
		return "\\small\\frac{"+num+"}{"+den+"}";
	}

	if(Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec) % 1 == 0)
		return Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec)

	while(
	Math.floor((num/den) * Math.pow(10, prec))/Math.pow(10,prec) !=
	Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec)){
	console.log(
	Math.floor((num/den) * Math.pow(10, prec))/Math.pow(10,prec)
	)
	console.log(
	Math.floor(n * Math.pow(10, prec))/Math.pow(10,prec)
	)

		if(num/den > n)
			den++;	
		else if (num/den < n)
			num++;
	}

	return "\\small\\frac{"+num+"}{"+den+"}";
}

function to_mixed(n, prec) {

}

function from_frac(f, prec) {
	f = f.replace(/}/g, "");
	var p = f.split("{");
	p.shift();

	return p[0]/p[1];
}

function from_mixed(m, prec) {

}

function refresh_all() {
	for (v in variables) {
		var V = variables[v];
		if(typeof V.max == "function" && V.max() < V.value)
			V.value = V.max();
	}
	for (m in matrices){
		 matrices[m].refresh();
	}
	for (f in formulas) formulas[f].refresh();
}

var set = function(id, val, i, j) {
	var f = variables[id];
	if(f) {
		if(f && i != undefined && j != undefined) 
			return set(id + ":" + i + "," + j, val) 
		else if (f && i != undefined) 
			return set(id, val)[i]

		var prec = f.prec || 5;
		console.log(prec);
		console.log(val);
		if (typeof val == "number") 
			val = Math.round(val * Math.pow(10, prec)) / Math.pow(10, prec);
		console.log(val);

		if(id.split(":").length > 1) { //if this is an element of a matrix,
			var arr = id.split(":")[0];	// find its parent
			var coords = id.split(":")[1];	// find its coordinates
			var i = coords.split(",")[0];
			var j = coords.split(",")[1];
			// block changes to locked identities
			var g = variables[arr];
			g.value[i][j] = val;		// set it
			var h = matrices[arr];	
			if(h.enforce.includes("symmetry")) {
				g.value[j][i] = val;
				variables[arr + ":" + j + "," + i]
					.value = val;	
			}
			h.change = true;
		}
	
		f.value = val;
	}
	return f.value;
}

var get = function(id, i, j) {
	if(id && i != undefined && j != undefined) return variables[id].A[i][j];
	var f = variables[id]
	if (f && i != undefined) return f.value[i]
	else if (f) return f.value;
	return f;
}

var inc = function(id, $i, $j) {
	if($i != undefined && $j != undefined) return inc(id + ":" + $i + "," + $j) 
	var f = variables[id];
	if(f){
		var max = ((f.max instanceof Function)? f.max() : parseFloat(f.max));
		var incr = f.inc || 1.0;
		var incr = parseFloat(incr);
		var min = ((f.min instanceof Function)? f.min() : parseFloat(f.min));
		var prec = f.prec || 5;
		var val = parseFloat(f.value);

		val += incr;
		var val = (typeof val == "number") ? Math.round(val * Math.pow(10, prec)) / Math.pow(10, prec) : val;

		if (!isNaN(max) && !isNaN(min) && val > max) val = min;
		else if (!isNaN(max) && val > max) val -= incr;

		f.value = val;

		if(id.includes(":") && id.includes(",")) { //if this is an element of a matrix,
			var arr = id.split(":")[0];	// find its parent
			var coords = id.split(":")[1];	// find its coordinates
			var i = coords.split(",")[0];
			var j = coords.split(",")[1];
		
			eval(arr).value[i][j] = val;		// set it

			var h = matrices[arr];
			
			if(h && h.enforce.includes("row-stochasticity")) {
				var r = Math.floor(Math.random() * h.A[i].length);
				while(r == j) r = Math.floor(Math.random() * h.A[i].length);

				if(h.A[i][j] == 0) {
					set(arr, 1, i, r);
				} else while (h.A[i].reduce(function(t, n){return t + n}) > 1){
					var k = inc(arr + ":k")
					if(k != j && h.A[i][k] >= 0.1) {
						dec(arr, i, k);
					}
				}
			}
			if(h && h.enforce.includes("element-uniqueness")) {
				for(k in A) for (l in h.A[k]){
					if(!(k == i && l == j) && h.A[k][l] == h.A[i][j])
						inc(arr,i,j);
				}
			}
	
			h.change = true;
		}

		return f.value; 
	}
}

var azinc = function(id) {
	var f = variables[id]
	if(f){

		return f; 
	}


}

var dec = function(id, i, j) {
	if(i != undefined && j != undefined) return dec(id + ":" + i + "," + j) 
	var f = variables[id];
	if(f){
		console.log(f)
		var max = ((f.max instanceof Function)? f.max() : parseFloat(f.max));
		var incr = f.inc || 1.0;
		var incr = parseFloat(incr);
		var min = ((f.min instanceof Function)? f.min() : parseFloat(f.min));
		var prec = f.prec || 5;
		console.log(f.value)
		var val = parseFloat(f.value);
		console.log(val)

		val -= incr;
		var val = (typeof val == "number") ? Math.round(val * Math.pow(10,prec)) / Math.pow(10,prec) : val;

		if (!isNaN(min) && !isNaN(max) &&  val < min) val = max;
		else if (!isNaN(min) && val < min) val += incr;

		f.value = val;

		if(id.includes(":") && id.includes(",")) { //if this is an element of a matrix,
			var arr = id.split(":")[0];	// find its parent
			var coords = f.id.split(":")[1];	// find its coordinates
			var i = coords.split(",")[0];
			var j = coords.split(",")[1];
		
			var g = variables[arr];
			g.value[i][j] = val;		// set it

			var h = matrices[arr];
			if(h && h.enforce.includes("row-stochasticity")) {
				if(h.A[i][j] == 1) {
					for(k in get(arr, i)) if (k != j) 
						set(arr, 0, i, k);
				} else while (h.A[i].reduce(function(t, n){return t + n}) < 1){
					var k = inc(arr + ":k")
					if(k != j && h.A[i][k] < 1) {
						inc(arr, i, k);
					}
				}

			}
			if(h && h.enforce.includes("element-uniqueness")) {
				for(k in h.A) for (l in h.A[k]){
					if(!(k == i && l == j) && h.A[k][l] == h.A[i][j])
						dec(arr,i,j);
				}
			}
			h.change = true;
		}

	}
	return f;
}

var click = function(id, i, j) {
	if(i != undefined && j != undefined) return click(id + ":" + i + "," + j);

	if(id.includes(":")){
		 if(id.split(":").length > 1) { //if this is an element of a matrix,
			var arr = id.split(":")[0];	// find its parent
			var coords = id.split(":")[1];	// find its coordinates
			var i = coords.split(",")[0];
			var j = coords.split(",")[1];
		
			var g = matrices[arr];
			g.interact(i, j, "click");
		}
	} else {
		var f = formulas[id];
		if (f) f.click();
	}
	return this.parent;
}

var rightclick = function(id, i, j) {
	if(i != undefined && j != undefined) return rightclick(id + ":" + i + "," + j);

	if(id.includes(":")){
		 if(id.split(":").length > 1) { //if this is an element of a matrix,
			var arr = id.split(":")[0];	// find its parent
			var coords = id.split(":")[1];	// find its coordinates
			var i = coords.split(",")[0]
			var j = coords.split(",")[1];
		
			var g = matrices[arr];
			g.interact(i, j, "rightclick");
		}
	}else {
		var f = formulas[id];
		if(f) f.rightclick();
	}
	return this.parent;
}

var update = function(id) {
	var f = formulas[id]; 
	if(f) f.update();
	else f = matrices[id];
	if(f) f.update();
	return this.parent;
}

var stopgo = function(id) {
	var t = timers[id];
	if(t) t.active = !t.active;
	return this.parent;
}

var stop = function(id) {
	var t = timers[id];
	if(t && t.active) t.active = false;
	return this.parent;
}

var go = function(id) {
	var t = timers[id];
	if(t) t.active = true;
	return this.parent;
}

var step = function(id) {
	var t = timers[id];
	if(t) t.execute();
	return this.parent;
}

var jump = function(id, steps) {
	var t = timers[id];
	for(var i = 0; i < steps; ++i)
		t.execute();
	return this.parent;
}

var run_timer = function(id) {
	var t = timers[id];
	if(t) setTimeout(function() {
		if(t.active) {
			t.execute();	
		}
		run_timer(id);
	}, t.inc * 1000)
}

$i = inc;
$d = dec;
$c = click;
$rc = rightclick;
$u = update;
$j = jump;
$r = go;
$h = stop;
$rh = stopgo;
$s = set;
$g = get;

variables = [];
formulas = [];
timers = [];

d3.selectAll("var").each(function() {
	var me = d3.select(this);
	var that = this;
	var v = {
		id: me.attr("id"),
		value: eval(me.text())
	}
	if(me.attr("within")) {			// variables with "within" attributes
		var arr = me.attr("within");	// are array indices
		v.min = 0;
		v.inc = 1;
		v.max = function() { return get(arr).length - 1; };
	}
	if(me.attr("min")) v.min = me.attr("min");
	if(me.attr("max")) v.max = me.attr("max");
	if(me.attr("inc")) v.inc = me.attr("inc");
	if(me.attr("prec")) v.prec = me.attr("prec");
	var f = variables[that.id];
	if(f == undefined)
		variables[v.id] = v;

	eval(me.attr("id") + "= v;");

	me.remove();
})

d3.selectAll("timer").each(function() {
	var me = d3.select(this);
	var that = this;
	var t = {
		id: me.attr("id"),
		rule: me.text() + ";",
		execute: function(){eval(this.rule)},
		active: false
	}
	if(me.attr("within")) {			// variables with "within" attributes
		var arr = me.attr("within");	// are array indices
		t.min = 0;
		t.max = function() { return get(arr).length - 1; };
	}
	if(me.attr("min")) t.min = me.attr("min") || 0;
	if(me.attr("max")) t.max = me.attr("max");
	if(me.attr("inc")) t.inc = me.attr("inc") || 0.5;
	var f = timers.find(function(d){return d.id == that.id;})
	if(f == undefined)
		timers[t.id] = t;

	run_timer(t.id);

	me.remove();
})

var formula = function(me) {
	var that = this;
	this.me = me;
	this.id = me.attr("id");
	this.style = me.attr("style");
	if(me.attr("numbers")) {
		this.fractionize = (me.attr("numbers") == "fractions")
		this.bfractionize = (me.attr("numbers").includes("fractions:"))
		if(this.bfractionize)
			this.b = parseFloat(me.attr("numbers").split(":")[1]);
	}

	this.clickable = false;

	me.selectAll("rule").each(function(){
		var t = d3.select(this).attr("type");
		var T = t.split(" ");
		for(i in T) {
			t = T[i];
			if(t == "click" || t == "rightclick" || t == "doubleclick")
			that.clickable = true;
		}
	})

	if(this.clickable) me.classed("clickable", true);

	this.rules = [];

	me.selectAll("rule").each(function() {
		var r = d3.select(this);
		var T = r.attr("type").split(" ");

		for(i in T) that.rules.push({
			id: r.node().parentElement.id,
			type: T[i],
			rule: r.text() + ";",
			execute: function(){eval(this.rule); that.refresh();}
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
		if(variables[that.vars[j]])
			this.ids.push(this.vars[j]);
	}

	this.me.on("click", function() {
		if(that.clickable) that.interact("click")
	});
	this.me.on("contextmenu", function() {
		d3.event.preventDefault();
		if(that.clickable) that.interact("rightclick")
	});
	this.me.on("doubleclick", function() {
		if(that.clickable) that.interact("doubleclick")
	});
	this.interact("initialize");
	this.refresh();
}

formula.prototype.directlyDepends = function(id) {
	return (this.original.includes("$" + id + "$"));
}

formula.prototype.interact = function(type) {
	for(r in this.rules)
		if(this.rules[r].type === type || this.rules[r].type === "any") 
			this.rules[r].execute();
}

formula.prototype.lock = function() {
	this.clickable = false;
	this.refresh();
}

formula.prototype.unlock = function() {
	this.clickable = true;
	this.refresh();
}

formula.prototype.uhlock = function() {
	this.clickable = !this.clickable;
}

formula.prototype.update = function() {this.interact("update")}
formula.prototype.click = function() {this.interact("click")}
formula.prototype.rightclick = function() {this.interact("rightclick")}
formula.prototype.initialize = function() {this.interact("initialize")}
formula.prototype.text = function(input) {}

var clean = function(str) {
	var st;
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
	var r = replaceFormulas(this.original, this.id);
	this.text = replaceVariables(replaceVariables(r, this.fractionize), this.fractionize);
	this.me.node().innerHTML = this.text;
	this.me.classed("clickable", this.clickable);
	katex.render(this.text, document.getElementById(this.me.attr("id")));
}

replaceVariables = function(str, fractionize){
	for(V in variables) {
		var v = variables[V];
		var val = v.value;
		var id = v.id;
		var p = v.prec || 5;
		var va;
		if(!isNaN(val)){
			if (fractionize)
				va = to_frac(val);
			else if (val && Math.abs(val) > 10e15)
				va = val.toExponential()
					.replace("e-", " \\times 10^{-")
					.replace("e+", " \\times 10^{") + "}";
			else
				va = val
					.toLocaleString("en", {maximumFractionDigits:p}); 
		} else va = val || "\\text{undefined}";
		// ^ really should have a flag for choosing interpretation of NaN
			//str = str.replace("{$|" + ids[j] + "|$}", "{" + Math.abs(va) + "}");
			//str = str.replace("($|" + ids[j] + "|$)", "(" + Math.abs(va) + ")");
			//str = str.replace("[$|" + ids[j] + "|$]", "[" + Math.abs(va) + "]");
		while(str.includes("{$"+id+"$}")) 
			str = str.replace("{$" + id + "$}", "{" + va + "}");
		while(str.includes("($"+id+"$)")) 
			str = str.replace("($" + id + "$)", "(" + va + ")");
		while(str.includes("[$"+id+"$]")) 
			str = str.replace("[$" + id + "$]", "[" + va + "]");
			//str = str.replace("$|" + ids[j] + "|$", Math.abs(va));
			if(!isNaN(val) && val < 0) va = "(" + va + ")";
			// negative numbers not immediately enclosed in brackets are parenthesized
		while(str.includes("$"+id+"$")) 
			str = str.replace("$" + id + "$", va);
	}
	return str;
}

replaceFormulas = function(str, id){
	d3.selectAll("formula").each(function() {
		var d = d3.select(this);
		var old = str;
		var o = originals[d.attr("id")]
		var tag = "$$" + d.attr("id") + "$$"
		while(str.includes(tag))
			str = str.replace(tag, o.text);
		if(old != str) { // need to substitute in the variables
			// since formulas may not be initialized as objects yet we reproduce
			// extraction of variable ids here (maybe use an if to avoid if not necessary)
			var ids = [];
			var vars = o.text.split("$")  
			vars.shift();
			vars.pop();
			var that = this;

			for(j in vars) 
				if(variables[vars[j]])
					ids.push(vars[j]);
			str = replaceVariables(replaceVariables(str, ids))
	
		}
	})
	return str;
}

var originals = [];

d3.selectAll("formula").each(function() { 
// make a reference of ids and initial text for use in the first pass of replaceFormulas
	var c = d3.select(this).text();
	var ch = d3.select(this).node().children;
	var chi = Array.from(ch);
	for(var i in chi) 
		c = c.replace(chi[i].textContent, "");
	originals[d3.select(this).attr("id")]
		= {id: d3.select(this).attr("id"), text: c}
})



var matrix = function(me) {
	var that = this;
	this.me = me;
	this.id = me.attr("id");
	this.style = me.attr("style") || "none";
	if(me.attr("numbers")) {
		this.fractionize = (me.attr("numbers") == "fractions")
		this.bfractionize = (me.attr("numbers").includes("fractions:"))
		if(this.bfractionize)
			this.b = parseFloat(me.attr("numbers").split(":")[1]);
	}
	this.identities = null;
	this.clickable = false;
	this.prec = me.attr("prec") || 2;
	this.brackets = me.attr("brackets") || "square";
	this.enforce = me.attr("enforce");
	this.inc = me.attr("inc") || null;
	this.min = me.attr("min") || null;
	this.max = me.attr("max") || null;
	this.within = me.attr("within") || null;
	this.fill = me.attr("fill") || "zero";
	if(this.fill == "random") this.fill = function() { 
		var max = (typeof this.max == "function")? this.max() : this.max;
		var min = this.min || 0;
		var inc = this.inc || 1;
		var dif = max - min;
		var spots = dif / inc + 1;
		var r = Math.floor(Math.random() * spots);
		return r * inc;
	}
	if(parseFloat(this.fill)){ var $f = parseFloat(this.fill); this.fill = function() { return $f;}}

	if(this.enforce) {			// id:k is an iterator used 
		var v = { 			// to determine which entry is adjusted next
						// in a row-stochastic matrix
			id: me.attr("id") + ":k",
			value: 0,
			min: 0,
			inc: 1,
			max: function() { return get(that.id)[0].length - 1; }
		}
		variables[v.id] = v;
		this.identities = this.enforce.split(" ").find(function(d){return d.includes("identities")}) || null;

		this.k = 0;

		if(this.identities) this.identities = this.identities.split(":")[1];
		else this.identities = null;
	}
	else this.enforce = "";

	me.selectAll("rule").each(function(){
		var t = d3.select(this).attr("type");
		var T = t.split(" ");
		for(i in T) {
			t = T[i];
			if(t == "click" || t == "rightclick" || t == "doubleclick")
			that.clickable = true;
		}
	})

	this.rules = [];

	me.selectAll("rule").each(function() {
		var r = d3.select(this);
		var T = r.attr("type").split(" ");

		for(i in T) that.rules.push({
			id: r.node().parentElement.id,
			type: T[i],
			text: r.text(),
			rule: function(A,i,j){ 
				var M = "[";
				for(a in A) {
					M += "[";
					for(b in A[a])
						M+= ((typeof A[a][b] == "string") ?
							"\"" + A[a][b].replace(/\\/g, "\\\\") + "\"," :
							A[a][b] + ",");
					M += "],";	 
				}
				M += "]";
				return "var $i = " + i + "; var $j = " + j
					+ ";" + this.text + ";"
				},
			execute: function($,i,j){eval(this.rule($,i,j)); that.refresh();}
		})
		r.remove();
	})

	eval("this.A = [" + me.text() + "]");
	this.change = true;
	this.ids = [];

	this.symmetric = this.enforce.includes("symmetry");

	for(i in this.A) for(j in this.A[i])
		if(i > j && this.symmetric) this.A[i][j] = this.A[j][i];

	for(i in this.A){ 
		var v = {
			id: me.attr("id") + ":" + i,
			value: this.A[i],
		}
		variables[v.id] = v;
		for(j in this.A[i]) {
			var vars = ("" + this.A[i][j]).split("$")
			vars.shift();
			vars.pop();

			for(k in vars) {
				if(variables[vars[k]])
					this.ids.push(vars[k]);
			}

			var v = {
				id: me.attr("id") + ":" + i + "," + j,
				value: this.A[i][j]
			}

			if(me.attr("within")) {
				var arr = me.attr("within");
				v.min = 0;
				v.inc = 1;
				v.max = function() { return get(arr).length - 1; };
			}
			if(me.attr("min")) v.min = me.attr("min");
			if(me.attr("max")) v.max = me.attr("max");
			if(me.attr("inc")) v.inc = me.attr("inc");
			if(me.attr("prec")) v.prec = me.attr("prec");
			var f = variables[that.id];
			if(f == undefined)
				variables[v.id] = v;
		}
	}

	variables[me.attr("id")] = {
		id: me.attr("id"),
		value: this.A
	}

	me.node().innerHTML = "";

	this.structure();
	this.interact("initialize");
	this.refresh();
}

matrix.prototype.structure = function() {
	var that = this;
	var s = parseFloat(d3.select("#"+this.id).style("font-size").replace("px", ""));
	var q = parseFloat(d3.select("#"+this.id).style("line-height").replace("px", ""))/18 || 1.2;
	this.t = d3.select("#" + this.id).append("table")
		.attr("style", 
			"margin:0px;" +
			"padding:0px;" +
			"display:inline;" +
			"border-spacing:0px;" 
		)
	this.m = this.t.append("tr")
	var b = 2 * (q*s)/21;
	this.lc = this.m.append("td")
		.attr("style", 
			"width:" + 5 * (s/17.3) + "px;" +
			"margin:0px;" +
			"padding:0px;" + 
			((that.brackets == "square")?
			"border-top:" + b + "px solid black;" +
			"border-left:" + b + "px solid black;" +
			"border-bottom:" + b + "px solid black;" : "" ) +
			((that.brackets == "bar")?
			"border-right:" + b + "px solid black;" : "" ) +
			((that.brackets == "double-bar")?
			"border-left:" + b + "px solid black;" +
			"border-right:" + b + "px solid black;" : "" )

		)

	this.matrix = this.m.append("td").append("table")
		.attr("style", "border-spacing:0px;padding:0px;")

	this.rc = this.m.append("td")
		.attr("style", 
			"width:" + 5 * (s/17.3) + "px;" +
			"margin:0px;" +
			"padding:0px;" +
			((that.brackets == "square")?
			"border-top:" + b + "px solid black;" +
			"border-right:" + b + "px solid black;" +
			"border-bottom:" + b + "px solid black;" : "" ) +
			((that.brackets == "bar")?
			"border-left:" + b + "px solid black;" : "" ) +
			((that.brackets == "double-bar")?
			"border-left:" + b + "px solid black;" +
			"border-right:" + b + "px solid black;" : "" )
		)

}

matrix.prototype.interact = function(i, j, type) {
	for(r in this.rules)
		if((this.rules[r].type === type || this.rules[r].type === "any") && !(i == j && this.identities != null)){
			this.rules[r].execute(this.A,i,j);
			if(this.enforce.includes("symmetry") && i != j) this.rules[r].execute(this.A,j,i);
	}
}

matrix.prototype.update = function() {this.interact(0, 0, "update")}
matrix.prototype.click = function(i, j) {this.interact(i, j, "click")}
matrix.prototype.rightclick = function(i, j) {this.interact(i, j, "rightclick")}
matrix.prototype.initialize = function(i, j) {this.interact(i, j, "initialize")}

matrix.prototype.refresh = function() {
	var that = this;
	var s = parseFloat(d3.select("#"+this.id).style("font-size").replace("px", ""));
	var q = parseFloat(d3.select("#"+this.id).style("line-height").replace("px", ""))/18 || 1.2;

	var rows = this.matrix.selectAll("tr")
		.data(this.A)

	if(this.identities != undefined && typeof this.identities == "number")
		for(i = 0; i < min(A.length, A[0].length); ++i)
			A[i][i] = this.identities;
		
	
	rows.enter().append("tr")
	rows.exit().remove();

	this.matrix.selectAll("tr")
		.data(this.A)
		.each(function(d,i){
			var col = d3.select(this).selectAll("td")
			.data(d)
			col.enter().append("td")
				.on("click", function(e,j) { that.interact(i, j, "click");})
				.on("contextmenu", function(e,j) { 
					d3.event.preventDefault();
					that.interact(i, j, "rightclick");})
				.on("doubleclick", function(e,j) { that.interact(i, j, "doubleclick");})

			col.exit().remove();
		})
	this.matrix.selectAll("tr")
			.each(function(d,i){
				d3.select(this).selectAll("td")
				.classed("clickable", function(e, j) {
					if(i == j && that.identities != null) return false;
					else return that.clickable;
				})
				.attr("style", function(d, j) {
					var S = 	 "padding-left:0px;" +
						"padding-right:0px;" +
						"text-align:center;" + 
						"margin:0px;";
					if(that.A[i].length == 1) {} 
					else if(!j) 
						S += "min-width:" + (11 * (s/17.3)) + "px;"
							+ "padding-right:" + (6 * (s/17.3)) + "px;";
					else if(j + 1 == that.A[i].length) 
						S += "min-width:" + (11 * (s/17.3)) + "px;"
							+ "padding-left:" + (6 * (s/17.3)) + "px;";
					else
						S += "min-width:" + (23 * (s/17.3)) + "px";
					return S;
				})
				.each(function(e, j){
					if(that.symmetric && i > j) var aij = that.A[j][i];
					else var aij = that.A[i][j];

					if(i == j && that.identities != null) 
						aij = parseFloat(that.identities);
					if(that.fractionize) 
						aij = to_frac(aij, that.prec);
					else if (that.bfractionize) 
						aij = to_frac(aij, that.prec, that.b)
					if(typeof aij == "string" && aij.includes("$"))
						katex.render(
							replaceVariables(
								replaceVariables(aij+"", that.fractionize), 
								that.fractionize), 
							d3.select(this).node()
						);
					else katex.render(aij+"", d3.select(this).node());

				})
			})

	this.t.style("vertical-align", (4.5-((11.9 * this.A.length - 1)* (q * s)/21)) + "px")
	// test with different font sizes

}

matrix.prototype.addRow = function(V) {
	if(V && V.length != this.A[0].length)
		console.log("Warn: size mismatch in appending row");
	var that = this;
	var i = this.A.length;

	if(V) this.A.push(V);
	else {
		this.A.push([]);
		for (j in this.A[0]){ 
			this.A[i].push(this.fill());
		}
	}

	if(this.identities != undefined) {
		var least = Math.min(this.A.length, this.A[0].length);
		for(k = 0; k < least; ++k) this.A[k][k] = this.identities;
	}
	
	for(j in this.A[i]) variables[that.id+":"+i+","+j] = {
		id: that.id + ":" + i + "," + j,
		value: that.A[i][j],
		min: that.min,
		max: that.max,
		inc: that.inc
	};

	variables[that.id+":"+i] = {
		id: that.id +":" + i,
		value: that.A[i]
	}

	variables[that.id].value = this.A;
}


matrix.prototype.addColumn = function(V) {
	var that = this;
	if(V) for (i in this.A) this.A[i].push(V[i]); 	// push new entries
	else for (i in this.A) {
		this.A[i].push(this.fill());
	}

	if(this.identities != undefined) {
		var least = Math.min(this.A.length, this.A[0].length);
		for(k = 0; k < least; ++k) this.A[k][k] = this.identities;
	}

	var j = this.A[0].length - 1;
	for(i in this.A) {				// update entry variables
		variables[that.id+":"+i+","+j] = {
			id: that.id + ":" + i + "," + j,
			value: that.A[i][j],
			min: that.min,
			max: that.max,
			inc: that.inc
		};
		variables[that.id+":"+i]
			.value = this.A[i];
	}

	variables[that.id].value = this.A;
}

matrix.prototype.removeRow = function(i) {
	if(!i) var i = this.A.length - 1;
	var removed = this.A.splice(i, 1);
	variables.splice(this.id+":"+i, 1);
	for(j in this.A[0])
		variables.splice(this.id + ":" + i + "," + j, 1);

	variables[this.id].value = this.A;
	return removed;
}

matrix.prototype.removeColumn = function(j) {
	if(!j) j = this.A[0].length - 1;
	var removed = [];
	for(i in this.A) {
		removed.push(this.A[i].splice(j, 1));
		variables.splice(this.id + ":" + i + "," + j, 1);
	}

	variables[this.id].value = this.A;
	return removed;
}

matrix.prototype.rowVector = function(i) {
	return this.A[i];
}

matrix.prototype.colVector = function(j) {
	var ret = [];
	for(i in this.A)
		removed.push(A[i][j]);
	return ret;
}

matrix.prototype.columns = function(cols) {
	if(!cols) return this.A[0].length;
	if(cols != this.A[0].length) this.change = true;
	while(this.A[0].length < cols)
		this.addColumn();
	while(this.A[0].length > cols)
		this.removeColumn();

}

matrix.prototype.rows = function(rows) {
	if(!rows) return this.A.length;
	if(rows != this.A.length) this.change = true;
	while(this.A.length < rows)
		this.addRow();
	while(this.A.length > rows)
		this.removeRow();
}

matrix.prototype.incr = function(i, j) {
	var f = this;
	var max = ((f.max instanceof Function)? f.max() : parseFloat(f.max));
	var incr = f.inc || 1.0;
	var incr = parseFloat(incr);
	var min = ((f.min instanceof Function)? f.min() : parseFloat(f.min));
	var prec = f.prec || 5;
	var val = parseFloat(f.A[i][j]);

	val += incr;
	var val = Math.round(val * Math.pow(10,prec)) / Math.pow(10,prec);
		var val = Math.round(val * Math.pow(10,prec)) / Math.pow(10,prec);

	if (!isNaN(max) && !isNaN(min) && val > max) val = min;
	else if (!isNaN(max) && val > max) val -= incr;
	
	this.A[i][j] = val;

	if(f && f.enforce.includes("row-stochasticity")) {
		var r = Math.floor(Math.random() * f.A[i].length);
		while(r == j) r = Math.floor(Math.random() * f.A[i].length);

		if(f.A[i][j] == 0) {
			f.A[i][r] = 1;
		} else while (f.A[i].reduce(function(t, n){return t + n}) > 1){
			this.k += 1;
			this.k %= this.A.length;
			if(this.k != j && f.A[i][this.k] >= incr) {
				this.decr(i, this.k);
			}
		}
	}
	if(f && f.enforce.includes("element-uniqueness")) {
		for(k in this.A) for (l in this.A[k]){
			if(!(k == i && l == j) && this.A[k][l] == this.A[i][j])
				this.incr(i,j);
		}
	}

	if(f.enforce.includes("elements-of")) {
		e = f.enforce.split(" ");
		g = e.find(function(d){return d.includes("elements-of:")});
		s = eval(g.split(":")[1]);

		var inS = false;
		for(k in s.A) if(!inS && s.A[k].indexOf(val) >= 0) {
			inS = true;
		}
		if(!inS) this.incr(i, j);
	}

	this.change = true;
	return f.value; 
}

matrix.prototype.decr = function(i, j) {
	var f = this; 
	var id = this.id;
	var max = ((f.max instanceof Function)? f.max() : parseFloat(f.max));
	var incr = f.inc || 1.0;
	var incr = parseFloat(incr);
	var min = ((f.min instanceof Function)? f.min() : parseFloat(f.min));
	var prec = f.prec || 5;
	var val = parseFloat(f.A[i][j]);

	val -= incr;
	var val = Math.round(val * Math.pow(10,prec)) / Math.pow(10,prec);

	if (!isNaN(min) && !isNaN(max) &&  val < min) val = max;
	else if (!isNaN(min) && val < min) val += incr;

	f.A[i][j] = val;

	if(f.enforce.includes("row-stochasticity")) {
		if(f.A[i][j] == 1) {
			for(k = 0; k < this.A[i].length; ++k) if (k != j) 
				this.A[i][k] = 0;
				set(this.id, 0, i, k);
		} else while (f.A[i].reduce(function(t, n){return t + n}) < 1){
			if(this.k != j && f.A[i][this.k] < 1) {
				this.incr(i, this.k);
			}
		}
	}
	if(f.enforce.includes("element-uniqueness")) {
		for(k in this.A) for (l in this.A[k]){
			if(!(k == i && l == j) && this.A[k][l] == this.A[i][j])
				this.decr(i, j);
		}
	}

	f.change = true;
	return this;
}



var matrices = [];

d3.selectAll("matrix").each(function() {
	var me = d3.select(this)
	matrices[me.attr("id")] = (new matrix(me));
	eval(me.attr("id") + "= matrices[me.attr(\"id\")];");

})


d3.selectAll("formula").each(function() {
	var me = d3.select(this);
	if(me.attr("id")) formulas[me.attr("id")] = new formula(me);
	else {
		if(Array.from(me.node().children).length) console.log("Warn: Child elements in static formula " + me.text());
		katex.render(me.text(), me.node());
	}
})

for(f in formulas){
	var id = formulas[f].id;
	for(o in originals) {
		if(originals[o].text.includes(id)) {
			var fff = formulas[o].id + "";
			formulas[id].rules[o] = {
				id: id,
				type: "any",
				execute: function(){
					formulas[fff].refresh();
				}
			}
		}
	}	
}

matrix.prototype.lock = function() {
	this.clickable = false;
	this.refresh();
}

matrix.prototype.unlock = function() {
	this.clickable = true;
	this.refresh();
}

matrix.prototype.uhlock = function() {
	this.clickable = !this.clickable;
	this.refresh();
}


