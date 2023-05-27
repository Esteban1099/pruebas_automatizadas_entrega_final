const compareImages = require("resemblejs/compareImages")
const config = require("./config.json");
const fs = require('fs');

const { options } = config;
let escenarios = [];

async function executeTest(){
	let path = './results/screenshots'
	escenarios = fs.readdirSync(path);

	for (folder of escenarios) {
		let path = './results/screenshots/' + folder;
		let pathV1 = path + '/chrome';
		let pathV2 = path + '/edge';
		let pathV3 = path + '/firefox';

		var filesV1 = fs.readdirSync(pathV1);
  		var filesV2 = fs.readdirSync(pathV2);
  		var filesV3 = fs.readdirSync(pathV3);

		if(filesV1.length === 0 && filesV2.length === 0 && filesV3.length === 0)
			return;
		
		let resultInfo = {}
		let arrayImgs = []
		let datetime = new Date().toISOString().replace(/:/g,"."); 

		let flag1 = true;
		let flag2 = false;

		while (flag1 && !flag2) {
			for(b of filesV1){
				arrayImgs.push(b)
				const data = await compareImages(
					fs.readFileSync(`${pathV1}/${b}`),
					fs.readFileSync(`${pathV2}/${b}`),
					options
				);

				resultInfo[b] = {
					isSameDimensions: data.isSameDimensions,
					dimensionDifference: data.dimensionDifference,
					rawMisMatchPercentage: data.rawMisMatchPercentage,
					misMatchPercentage: data.misMatchPercentage,
					diffBounds: data.diffBounds,
					analysisTime: data.analysisTime
				}

				var dir = `./results/chromeVSedge_${folder}`;
				if (!fs.existsSync(dir)) 
					fs.mkdirSync(dir);

				fs.writeFileSync(`./results/chromeVSedge_${folder}/compare-${b}`, data.getBuffer());
			}	
			flag1 = false;
			flag2 = true;
			fs.writeFileSync(`./results/chromeVSedge_${folder}/report.html`, createReport(datetime, resultInfo,arrayImgs, folder, "chrome", "edge"));
			fs.copyFileSync('./index.css', `./results/chromeVSedge_${folder}/index.css`);
		}
		
		while (flag2 && !flag1) {
			for(b of filesV1){
				arrayImgs.push(b)
				const data = await compareImages(
					fs.readFileSync(`${pathV1}/${b}`),
					fs.readFileSync(`${pathV3}/${b}`),
					options
				);

				resultInfo[b] = {
					isSameDimensions: data.isSameDimensions,
					dimensionDifference: data.dimensionDifference,
					rawMisMatchPercentage: data.rawMisMatchPercentage,
					misMatchPercentage: data.misMatchPercentage,
					diffBounds: data.diffBounds,
					analysisTime: data.analysisTime
				}

				var dir = `./results/chromeVSfirefox_${folder}`;
				if (!fs.existsSync(dir))
					fs.mkdirSync(dir);

				fs.writeFileSync(`./results/chromeVSfirefox_${folder}/compare-${b}`, data.getBuffer());
			}
			flag2 = false;
			fs.writeFileSync(`./results/chromeVSfirefox_${folder}/report.html`, createReport(datetime, resultInfo,arrayImgs, folder, "chrome", "firefox"));
			fs.copyFileSync('./index.css', `./results/chromeVSfirefox_${folder}/index.css`);
		}		
	}
	
	console.log('------------------------------------------------------------------------------------')
	console.log("Execution finished. Check the report under the results folder")
		
	let resultInfo = {}
	return resultInfo;  

  }

  function browser(b, info, folder, nav1, nav2){

	let path = '../Screenshots/' + folder;

	var aux = `<div class=" browser" id="test0">
				<div class=" btitle">
					<h2>Escenario: ${b}</h2>
					<p>Data: ${JSON.stringify(info)}</p>
				</div>
				<div class="imgline">
					<div class="imgcontainer">
						<span class="imgname">Reference</span>
						<img class="img2" src="${path}/${nav1}/${b}" id="refImage" label="Reference">
					</div>
					<div class="imgcontainer">
						<span class="imgname">Test</span>
						<img class="img2" src="${path}/${nav2}/${b}" id="testImage" label="Test">
					</div>
				</div>
				<div class="imgline">
					<div class="imgcontainer">
						<span class="imgname">Diff</span>
						<img class="imgfull" src="./compare-${b}" id="diffImage" label="Diff">
					</div>
				</div>
			</div>`
			return aux;
	}

function createReport(datetime, resInfo, arrayImgs, folder, nav1, nav2){
    return `
    <html>
        <head>
            <title> VRT Report </title>
            <link href="index.css" type="text/css" rel="stylesheet">
        </head>
        <body>
            <h1>Report for 
                 <a href="${config.url}"> ${config.url}</a>
            </h1>
            <p>Executed: ${datetime}</p>
            <div id="visualizer">
                ${arrayImgs.map(b=>browser(b, resInfo[b], folder, nav1, nav2))}
            </div>
        </body>
    </html>`
}
(async ()=>console.log(await executeTest()))();