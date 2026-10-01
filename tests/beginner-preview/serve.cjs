// Isolated localhost UI fixture. No account, auth changes, or production route.
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = path.resolve(__dirname,'../..');
const out = path.join(root,'tmp/beginner-ui-test');
webpack({
  mode:'development', devtool:false,
  entry:path.join(__dirname,'entry.tsx'),
  output:{path:out,filename:'preview.js'},
  resolve:{extensions:['.tsx','.ts','.js'],alias:{'@':path.join(root,'src')}},
  module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.join(__dirname,'loader.cjs')}]},
},(error,stats)=>{
  if(error||stats.hasErrors()) { console.error(error||stats.toString({all:false,errors:true}));process.exitCode=1;return; }
  if(process.argv.includes('--build-only')) { console.log('Beginner UI fixture rebuilt.');return; }
  const styles=['globals.css','student-vibrant.css','workspace-settings.css','motion.css','grammar.css'];
  const html='<!doctype html><html lang="en" data-theme="forest" data-theme-mode="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Beginner course UI test</title>'+styles.map(f=>`<link rel="stylesheet" href="/style/${f}">`).join('')+'</head><body><div id="root"></div><script src="/preview.js"></script></body></html>';
  http.createServer((req,res)=>{
    if(req.url==='/?mobile=1') {res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><title>Mobile Beginner test</title></head><body style="margin:0;background:#ddd"><iframe title="Mobile course preview" src="/course" style="display:block;border:0;width:390px;height:844px;margin:12px auto"></iframe></body></html>');return;}
    if(req.url==='/preview.js') {res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(out,'preview.js')));return;}
    const style=styles.find(f=>req.url==='/style/'+f);
    if(style) {res.setHeader('Content-Type','text/css');res.end(fs.readFileSync(path.join(root,'src/app',style)));return;}
    if(req.url==='/'||req.url==='/course') {res.setHeader('Content-Type','text/html');res.end(html);return;}
    res.statusCode=404;res.end('Not found');
  }).listen(3131,'127.0.0.1',()=>console.log('Beginner UI fixture: http://127.0.0.1:3131 (mobile: /?mobile=1)'));
});
