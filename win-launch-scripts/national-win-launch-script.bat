@ECHO OFF
START "Start node server" CMD /K "CD..&& set NODE_ENV=development&& nodemon -e js,jsx,cjsx,css,scss,html,coffee --watch ./app/ server/server.js"
START "Start node hot load server" CMD /K "CD..&& set NODE_ENV=development&& node server/hotLoadServer.js"
