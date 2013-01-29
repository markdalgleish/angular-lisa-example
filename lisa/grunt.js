module.exports = function(grunt) {

  grunt.initConfig({
    jasmine: {
      amd: true,
      helpers: [
        'test/lib/es5-shim.js',
        'test/lib/require.js',
        'test/helpers/requireConfig.js'
      ],
      specs : 'test/specs/*Spec.js'
    },
    lint: {
      files: [ 'grunt.js', 'src/*.js' ]
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint jasmine'
    },
    jshint: {
      options: {
        bitwise: false,
        curly: true,
        jquery: true,
        debug: false,
        devel: false,
        eqeqeq: true,
        eqnull: true,
        expr: true,
        forin: false,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: false,
        nonew: false,
        nomen: false,
        plusplus: false,
        regexp: false,
        undef: true,
        sub: true,
        white: false,
        scripturl: true,
        trailing: true
      },
      globals: {
        exports: true,
        module: false,
        define: true,
        window: true
      }
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-jasmine-runner');

  grunt.registerTask('default', 'lint jasmine');

};
