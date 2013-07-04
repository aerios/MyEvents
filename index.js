var underscore = require('underscore')._;

var Event = {
	__callback:{},
	trigger:function(event){
		if(!this.__callback[event])return this;
		var args = underscore.toArray(arguments).slice(1);
		underscore.each(this.__callback[event],function(val){
			val[0].apply(val[1],args);
		});
		return this;
	},
	bind:function(event,callback,context){
		if(!this.__callback[event])this.__callback[event] = [];
		this.__callback[event].push([callback,context]);
		return this;
	},
    unbind:function(event){
        this.__callback[event] = null;
        return this;
    }
}

var Promise = underscore.extend({},{                
                state:{
                    unfulfilled:true,
                    fulfilled:false,
                    failed:false
                },
                result:null,
                progressValue:null,
                getState:function(type){
                    return this.state[type];
                },
                isUnfulfilled:function(){
                    return this.getState('unfulfilled');
                },
                isFulfilled:function(){
                    return this.getState('fulfilled');
                },
                isFailed:function(){
                    return this.getState('failed');
                },
                progress:function(name,data){
                    var p = {
                        name:name,
                        value:data
                    }
                    this.progressValue = p;
                    this.trigger('progress',p);
                    return this;
                },
                onProgress:function(fn,ctx){
                    if(!this.isUnfulfilled())return this;
                    //check if there are any previous progress
                    var p = this.progressValue;
                    //if exist, trigger this fn
                    if(p)fn.call(ctx,p);
                    //then bind this fn to progress event
                    this.bind('progress',fn,ctx);
                    return this; 
                },
                then:function(fulfill,error,context,debug){
                    if(this.isUnfulfilled()){
                        if(underscore.isFunction(fulfill))this.bind('fulfill',fulfill,context);
                        if(underscore.isFunction(error))this.bind('failed',error,context);
                    }else if(this.isFulfilled()){
                        if(underscore.isFunction(fulfill))
                            fulfill.call(context,this.result);
                    }else if(this.isFailed()){
                        if(underscore.isFunction(error))
                            error.call(context,this.result);
                    }
                    if(debug == 'debug'){
                        console.log(this,arguments);
                    }
                    return this;
                },
                resolve:function(state,result){
                    if(!this.isUnfulfilled())return;
                    this.result = result;
                    this.state.unfulfilled = false;
                    if(state == 'fulfill'){
                        this.state.fulfilled = true;
                    }else if(state == 'failed'){
                        this.state.failed = true;
                    }
                    this.unbind('progress');
                    this.trigger(state,result);
                },
                fulfill:function(result){
                    this.resolve('fulfill',result);
                    return this;
                },
                fail:function(result){
                    this.resolve('failed',result);
                    return this;
                },
                done:function(fn,c,debug){
                    if(debug == 'debug'){console.log('enter done')}
                    return this.then(fn,null,c,debug);
                },
                rejected:function(fn,c){
                    return this.then(null,fn,c);
                },
                always:function(fn,c){
                    return this.then(fn,fn,c);
                }
            },Event);   



var Driver = {
	clone:function(){
		var d =  JSON.parse(JSON.stringify(Event));
		d.trigger= Event.trigger;
		d.bind = Event.bind;
		return d;
	},
	getPromise:function(){
		var p = JSON.parse(JSON.stringify(Promise));
        p = underscore.defaults({},p,Promise);
        return p;
	},
    getDelay:function(time){
        var p = this.getPromise();
        var t = underscore.delay(function(){
            p.fulfill();
        },time);
        p.destroy = function(){
            clearTimeout(t);
        }
        return p;
    },
    spreadPromise:function(args){
        var p =this.getPromise();
        //var args = underscore.toArray(arguments);
        var after = underscore.after(args.length,function(){
            p.fulfill(val);
        })
        var val = [];
        var e = 0;
        underscore.each(args,function(o,i){
            var pr;
            if(underscore.isFunction(o)){
                pr = o();
            }else{
                pr = o;
            }

            pr.always(function(){
                val[i] = arguments;
                var idx = underscore.uniqueId("U_");                
                p.progress(idx,{
                    total:args.length,
                    progress:++e
                });
                after();
            })
        })
        // p.onProgress(function(data){
        //     var val = data.value;
        //     console.log("Spreader progress :",val.progress,"/",val.total);
        // })
        return p;
    }
};



module.exports = Driver;
