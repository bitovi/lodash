var extend = function(d, s){
	for(var prop in s) {
		d[prop] = s[prop];
	}
	return d;
};


module.exports = function(existingTags){
	var tags = extend({}, existingTags);
	
	return extend(tags,{
		returns: existingTags["return"],
		private: existingTags.hide,
		example: {
			add: function(line){
				return {
					lines: []
				};
			},
			addMore: function(line, curData) {
				curData.lines.push(line);
			},
			end: function(line, curData){
				this.body += "```\n"+
					curData.lines.join("\n").trim()+
					"\n```\n";
			}
		},
		"static": {
			add: function(){
				this["static"] = true;
			}
		},
		"memberof": {
			add: function(line){
				var member = line.match(/\s*@\w+\s+([^\s]+)/)[1];
				if(this.name && this.name.indexOf("argsClass") >= 0) {
					console.log("\n\n", this.name, line);
				}
				if(this.name &&  this.name.indexOf(member) !== 0 ) {
					this.name = member+"."+this.name.replace("_.","");
				}
				this.parent = member;
			}
		},
		"type": {
			add: function(line){
				var type = line.match(/\s*@\w+\s+([^\s]+)/)[1];
				this.types = [{type: type}];
			}
		},
		"category" : extend(existingTags._default)
	});
};
