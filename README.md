# Installation
Make sure you have Git, GruntJS and Bower.

#### Clone
    $ git clone https://github.com/losbeekos/basos.git projectname

#### Bower dependencies
Install the Bower dependencies, see bower.json.

    $ bower install

#### Node dependencies
Install the Node dependencies, see package.json.

    $ npm install

#### Start server
Start the web server which is used by BrowserSync.

    $ grunt connect

#### Run browserSync
Run BrowserSync to auto reload when dist files change.

    $ grunt browserSync