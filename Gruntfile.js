var constants = require('./constants');

module.exports = function(grunt) {

    // display elapsed time of grunt tasks
    require('time-grunt')(grunt);

    // load tasks automatically
    require('jit-grunt')(grunt, {
        'ngtemplates': 'grunt-angular-templates'
    });

    grunt.initConfig({
        // clean dist directory
        clean: {
            all: ['public/dist/**'],
            js: ['public/dist/js/**'],
            css: ['public/dist/css/**']
        },

        // check all js files for lint and code style errors
        jshint: {
            options: {
                force: true,
                jshintrc: '.jshintrc'
            },
            all: ['public/src/*.js', 'public/src/**/*.js']
        },

        jscs: {
            options: {
                force: true,
                config: '.jscsrc'
            },
            all: ['public/src/*.js', 'public/src/**/*.js']
        },

        concat: {
            options: {
                separator: ';',
                sourceMap: true
            },
            all: {
                files: {
                    'public/dist/js/app.js': [
                        'public/src/**/*.module.js',
                        'public/src/**/*.js',
                        'public/src/*.js',
                        'public/dist/js/app.templates.js'
                    ]
                }
            }
        },

        // take all the js files and minify them into app.min.js
        uglify: {
            options: {
                compress: true,
                sourceMap: true,
                ASCIIOnly: true,
                preserveComments: false
            },
            all: {
                files: {
                    'public/dist/js/app.min.js': 'public/dist/js/app.js'
                }
            }
        },

        // process the less file to style.css
        less: {
            all: {
                files: {
                    'public/dist/css/styles.css': 'public/src/**/*.less'
                }
            }
        },

        // take the processed styles.css file and minify
        cssmin: {
            all: {
                files: {
                    'public/dist/css/styles.min.css': 'public/dist/css/styles.css'
                }
            }
        },

        // use ngtemplates to cache templates into $templateCache
        ngtemplates: {
            all: {
                options: {
                    module: 'App',
                    standalone: false,
                    htmlmin: {
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        collapseBooleanAttributes: true,
                        removeCommentsFromCDATA: true,
                        removeOptionalTags: true
                    }
                },
                cwd: 'public/src',
                src: '**/*.template.html',
                dest: 'public/dist/js/app.templates.js'
            }
        },

        // copy index file from src to dist
        copy: {
            index: {
                src: 'public/src/index.html',
                dest: 'public/dist/index.html'
            }
        },

        // inject bower dependencies automatically in the index file
        wiredep: {
            dev: {
                src: 'public/dist/index.html'
            },
            prod: {
                src: 'public/dist/index.html'
            }
        },

        // inject custom css, js files in the index file
        injector: {
            dev: {
                options: {
                    ignorePath: 'public',
                    addRootSlash: false
                },
                files: {
                    'public/dist/index.html': [
                        'public/dist/js/*.js',
                        'public/dist/css/*.css'
                    ]
                }
            },
            prod: {
                options: {
                    ignorePath: 'public',
                    addRootSlash: false
                },
                files: {
                    'public/dist/index.html': [
                        'public/dist/js/*.min.js',
                        'public/dist/css/*.min.css'
                    ]
                }
            }
        },

        // watch css and js files and process the above tasks
        watch: {
            css: {
                files: ['public/src/css/*.less'],
                tasks: ['minify-css']
            },
            js: {
                files: ['public/src/*.js', 'public/src/**/*.js'],
                tasks: ['analyze', 'minify-js']
            },
            app: {
                files: ['public/src/**'],
                tasks: ['build-dev']
            }
        },

        // configure nodemon to start up server
        nodemon: {
            all: {
                script: 'server.js'
            }
        },

        // run watch and nodemon at the same time
        concurrent: {
            serve: {
                options: {
                  logConcurrentOutput: true
                },
                tasks: ['nodemon', 'watch:app']
            }
        },

        // set and run express server
        express: {
            local: {
                options: {
                    port: process.env.PORT || constants.port,
                    bases: '.',
                    open: true,
                    debug: true,
                    server: 'server.js'
                }
            }
        }

    });

    // fix for grunt-express which needs grunt-contrib-watch loaded first
    grunt.loadNpmTasks('grunt-contrib-watch');

    // register tasks
    // default task ran with grunt uses nodemon, uncomment app.listen in server.js
    grunt.registerTask('default', [
        'build-dev',
        'concurrent:serve'
    ]);

    // analyze
    grunt.registerTask('analyze', [
        'jshint',
        'jscs'
    ]);

    // concat and uglify js files
    grunt.registerTask('minify-js', [
        'concat',
        'uglify'
    ]);

    // less to css and minify
    grunt.registerTask('minify-css', [
        'less',
        'cssmin'
    ]);

    // build dev
    grunt.registerTask('build-dev', [
        'clean:all',
        'analyze',
        'minify-css',
        'ngtemplates',
        'concat',
        'copy:index',
        'wiredep:dev',
        'injector:dev'
    ]);

    // build prod
    grunt.registerTask('build-prod', [
        'clean:all',
        'analyze',
        'minify-css',
        'ngtemplates',
        'minify-js',
        'copy:index',
        'wiredep:prod',
        'injector:prod'
    ]);

    grunt.registerTask('only-server', [
        'express:local',
        'watch:app'
    ]);

    // serve dev
    grunt.registerTask('serve-dev', [
        'build-dev',
        'express:local',
        'watch:app'
    ]);

    // serve prod
    grunt.registerTask('serve-prod', [
        'build-prod',
        'express:local',
        'watch:app'
    ]);
}
