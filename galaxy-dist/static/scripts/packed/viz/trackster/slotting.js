define(["libs/underscore"],function(c){var f=c.extend;var d=2,b=5;var a=function(h,g){this.slot=h;this.feature=g};var e=function(j,i,g,h){this.slots={};this.start_end_dct={};this.w_scale=j;this.mode=i;this.include_label=(i==="Pack");this.max_rows=g;this.measureText=h};f(e.prototype,{_get_draw_coords:function(j){var h=Math.floor(j[1]*this.w_scale),i=Math.ceil(j[2]*this.w_scale),g=j[3],k;if(g!==undefined&&this.include_label){var l=this.measureText(g).width+(d+b);if(h-l>=0){h-=l;k="left"}else{i+=l;k="right"}}return[h,i]},_find_slot:function(j){var o=j[0],n=j[1];for(var l=0;l<=this.max_rows;l++){var p=false,m=this.start_end_dct[l];if(m!==undefined){for(var g=0,h=m.length;g<h;g++){var i=m[g];if(n>i[0]&&o<i[1]){p=true;break}}}if(!p){return l}}return -1},slot_features:function(h){var q=this.start_end_dct,v=[],m=0,x,l;for(var o=0,t=h.length;o<t;o++){x=h[o];l=x[0];var g=this.slots[l];if(g){if(x[1]<g.feature[1]||g.feature[2]<x[2]){console.log(x[3],g.slot,this._find_slot(this._get_draw_coords(x)));var s=this._get_draw_coords(g.feature),p=this._get_draw_coords(x),j=this.start_end_dct[g.slot];for(var n=0;n<j.length;n++){var w=j[n];if(w[0]===s[0]&&w[1]===s[1]){j[n]=p}}}m=Math.max(m,this.slots[l].slot)}else{v.push(o)}}for(var o=0,t=v.length;o<t;o++){x=h[v[o]];l=x[0];var r=this._get_draw_coords(x);var u=this._find_slot(r);if(u>=0){if(q[u]===undefined){q[u]=[]}q[u].push(r);this.slots[l]=new a(u,x);m=Math.max(m,u)}}return m+1}});return{FeatureSlotter:e}});