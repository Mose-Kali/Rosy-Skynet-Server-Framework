//resMime.js
exports.getMime = (fs,extname)=>{
    // fs.readFile('mime.json', (err,data)=>{
    // 	if(err){
    // 		console.log(err);
    // 	}else{
    // 		var mime = JSON.parse(data.toString());
    // 		return mime[extname] || 'text/html'
    // 	}
    // });  异步拿不到数据
   
       var data = fs.readFileSync(__dirname+'/SkynetConfigs/SkynetSystemProfiles/SkynetFileTypesMapper.json');
       var Mimes = JSON.parse(data.toString());
       return Mimes[extname] || 'text/html'
  }