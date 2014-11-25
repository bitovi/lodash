var _ = require("lodash");


// theme/templates/helpers.js
module.exports = function(docMap, options, getCurrent, helpers){
	
	var categories = {};
	_.forEach(docMap, function(docObject, name){
		var cat = docObject.category;
		if(!cat && docObject.type === "property" && docObject.types) {
			cat =  "Properties";
		}
		
		if(!cat) {
			return;
		}
		
		if(!categories[cat]) {
			categories[cat] = [];
		}
		var docs = categories[cat];
		docs.push({
			name: name,
			docObject: docObject,
			shortName: name.replace("_.",""),
			underscorePart: name === "_" ? "" : "_."
		});
		if(docObject.alias) {
			var alias = typeof docObject.alias === "string" ?
				[docObject.alias] : docObject.alias;
			
			alias.forEach(function(alias){
				docs.push({
					isAlias: true,
					underscorePart: "_.",
					shortName: alias.replace("_.",""),
					newName: name.replace("_.","").replace("prototype.",""),
					origNewName: name,
					name: alias.indexOf("_.") === 0 ? alias : "_."+alias,
					docObject: docObject
				});
			});
			
		}
		
	});
	
	var compare = function(a,b){
		if(a.name > b.name) {
			return 1
		} else if(a.name === b.name) {
			return 0
		} else {
			return -1;
		}
	};
	
	var sortedCategories = [];
	for(var name in categories) {
		
		if(name !== "Properties") {
			sortedCategories.push(name);
		}
		categories[name].sort(function(a, b){
			var aProto = a.name.indexOf(".prototype.") >= 0,
				bProto = b.name.indexOf(".prototype.") >= 0;
			if( (aProto && bProto) || (!aProto && !bProto) ) {
				return compare(a, b);
			} else if(aProto){
				return 1;
			} else {
				return -1;
			}
		});
	}
	sortedCategories.sort();
	sortedCategories.push("Properties");
	
	
	
	
	return {
		"eachCategory": function(options){
			return _.map(sortedCategories, function(name){
				return options.fn({
					name: name.replace("_.",""),
					underscorePart: name === "_" ? "_" : "_."
				});
			}).join("");
		},
		"eachItem": function(name, options){
			return _.map(categories[name], function(doc, i){
				return options.fn(doc);
			}).join("");
		},
		"eachDocObject": function(name, options){
			return _.map(categories[name], function(doc, i){
				return doc.isAlias ? "" : options.fn(doc.docObject);
			}).join("");
		},
		makeId: function(){
			return (this.isAlias ? this.origNewName : this.name ).replace("_.","").replace(/\./g,"_");
		},
		makeParamsString: (function(){
			return function(params){
				if(!params || !params.length){
					return "";
				}
				return params.filter(function(param){
						return param.name.indexOf(".") === -1
					})
					.map(function(param){
						// try to look up the title
						var type = param.types && param.types[0] && param.types[0].type
						return helpers.linkTo(type, param.name) +
							( param.variable ? "..." : "" );
					}).join(", ");
			};
		})()
	};
};