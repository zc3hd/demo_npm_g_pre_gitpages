var path = require('path');
// 执行命令
var root_path = './';
var fs = require('fs-extra');
var files = ['cc_git', 'cc_main', 'cc_readme'];

var Promise = require("bluebird");

// 修改版的tianshu 
var handle = require('./cc_tianshu');


function FileHandle() {
}
FileHandle.prototype = {
  init: function() {
    var me = this;
    // 生成公用文件夹
    me.creat_common_f();

    // 移动demo文件到生成的readme文件夹
    me.move_demo_readme()
      // 读取当前文件夹下面的文件信息
      .then(function() {
        console.log('**移动demo文件到生成的cc_readme文件夹成功**');
        console.log('---------------------------------------------');
        // 读取当前文件夹下面所有文件
        return me.read_current_dir();
      })
      // 处理当前文件下下面的文件
      .then(function(arr) {
        me.handle_files(arr);

        // 因为readme下面的webapp 和readme是同步处理的。故读取readme下面的数据需要在第一个异步完成里面进行
        me.read_dir('cc_readme', null)
          // 读取readme文件下的数据
          .then(function(readmeArr) {
            /* body... */
            return me.for_dir(readmeArr);
          })
          .then(function(arr) {
            /* body... */
            me.for_webapp_dir(arr);
          });


        // readme.md的处理
        me.read_dir('cc_readme', null)
          .then(function(readmeArr) {
            // 同步读取文件的信息
            var info = me.for_dir_to_md(readmeArr);
            // 标题处的标记
            var info_arr = info.split('~c~');
            // console.log(info_arr.length);
            me.handle_info(info_arr);
          });
      })

  },
  // --------------------------------------------主文件夹生成
  // 生成公用文件夹
  creat_common_f: function() {
    /* body... */
    var me = this;
    for (var i = 0; i < files.length; i++) {
      fs.mkdirSync(path.join(root_path, files[i]));
      console.log(files[i] + '------文件夹生成完毕');
    };
  },
  // -------------------------------------------------文件移动
  // 移动demo文件到生成的readme文件夹
  move_demo_readme: function() {
    /* body... */
    var demo_path = path.join(__dirname, './../../demo');
    var target_path = path.join(root_path, 'cc_readme');
    return new Promise(function(resolve, reject) {
      fs.copy(demo_path, target_path, function(err) {
        if (err) reject(err);
        resolve();
      })
    })
  },
  // 读取当前目录下的文件夹
  read_current_dir: function() {
    /* body... */
    return new Promise(function(resolve, reject) {
      /* body... */
      fs.readdir(root_path, function(err, arr) {
        /* body... */
        if (err) reject(err);
        resolve(arr);
      })
    });
  },
  // 处理当前文件下下面的文件
  handle_files: function(arr) {
    /* body... */
    var me = this;
    for (var i = 0; i < arr.length; i++) {

      var isDir = fs.statSync(path.join(root_path, arr[i])).isDirectory();
      // ------------------------文件夹
      if (isDir) {
        // 主的文件夹
        if (arr[i].substr(0, 3) == 'cc_') {
          console.log('---cc_file--跳过')
        }
        // 其他文件夹的处理
        else {
          // webapp
          me.handle_commom(arr[i], 'webapp');
        }
      }
      // ------------------------文件
      else {
        // readme.md
        me.handle_commom(arr[i], 'readme.md');
      }

    }
  },
  // 统一的处理
  handle_commom: function(name, handleTarget) {
    /* body... */
    var me = this;
    if (name.toLowerCase() == handleTarget) {
      me.handle_copy(name, 'cc_main');
      me.handle_copy(name, 'cc_readme');
      me.handle_rm(name);
    } else {
      me.handle_move(name, 'cc_main')
    }
  },
  // ---------webapp/readme.md  同步
  // 复制
  handle_copy: function(name, target) {
    /* body... */
    var me = this;
    fs.copySync(path.join(root_path, name), path.join(root_path, target, name));
    console.log(name + '------复制到文件夹--' + target + '成功');
  },
  // 删除
  handle_rm: function(name) {
    /* body... */
    var me = this;
    fs.removeSync(path.join(root_path, name));
    console.log('根目录下的' + name + '-删除成功');
    console.log('--------------------------------------------------')
  },
  // -----------other dir/flie  异步
  handle_move: function(name, target) {
    /* body... */
    var me = this;
    fs.move(path.join(root_path, name), path.join(root_path, target, name), function(err) {
      if (err) return console.error(err)
      console.log(name + '------移动到文件夹--' + target + '成功');
    })
  },
  // -------------------------------------------------文件处理
  // ---------------------------------webapp
  read_dir: function(dir, dir1) {
    /* body... */
    var me = this;
    return new Promise(function(resolve, reject) {
      /* body... */
      var path_dir = null;
      if (dir1 == null) {
        path_dir = path.join(root_path, dir);
      } else {
        path_dir = path.join(root_path, dir, dir1);
      }
      fs.readdir(path_dir, function(err, arr) {
        if (err) reject(err);
        console.log('***________***');

        if (dir1 != null) {
          console.log('读取到' + dir + '/' + dir1 + '下面的文件信息');
        }

        resolve(arr);
      })
    });
  },
  // 变量readme下面的文件
  for_dir: function(arr) {
    /* body... */
    var me = this;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].toLowerCase() == 'webapp') {
        // 记录webapp这个文件名
        me.webapp = arr[i];
        return me.read_dir('cc_readme', arr[i]);
        break;
      }
    }
  },
  // 处理webapp下的文件夹
  for_webapp_dir: function(arr) {
    /* body... */
    var me = this;
    for (var i = 0; i < arr.length; i++) {
      // readme_img
      if (arr[i].toLowerCase() == 'readme_img') {
        console.log('-----' + arr[i] + '文件夹保留')
      }
      // 其他文件
      else {
        fs.removeSync(path.join(root_path, 'cc_readme', me.webapp, arr[i]));
        console.log('-----cc_readme/' + me.webapp + '/' + arr[i] + '删除成功**');
      }
    }
    console.log('__________________________cc_readme/' + me.webapp + '下文件处理完成___________________________')
  },
  // ----------- ---------------------readme
  for_dir_to_md: function(arr) {
    /* body... */
    var me = this;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].toLowerCase() == 'readme.md') {
        // 记录webapp这个文件名
        me.readmeMD = arr[i];
        return me.read_readme('cc_readme', arr[i]);
        break;
      }
    }
  },
  // 读取readme.md文件
  read_readme:function (dir,name) {
    var me = this;
    return fs.readFileSync(path.join(root_path, dir, me.readmeMD),'utf8');
    /* body... */
  },
  // 处理md文件
  handle_info:function (arr) {
    /* body... */
    var me = this;
    var title = arr[0].slice(2);
    title = title+'\n========'
    // console.log(title);
    // 添加表头
    fs.writeFileSync(path.join(root_path, 'cc_readme', 'section','00_header.md'),title,'utf8');
    console.log('抽取readme.md文件到标题成功');
    // 添加主体
    fs.writeFileSync(path.join(root_path, 'cc_readme', 'section','01_body.md'),arr[1],'utf8');
    console.log('抽取readme.md文件到内容成功');
    // 
    fs.removeSync(path.join(root_path, 'cc_readme', me.readmeMD));
    console.log('抽取readme.md完成--删除成功--');

    handle.cc_tianshu(path.join(root_path, 'cc_readme', 'index.tpl'));
  }
};

// 执行函数
new FileHandle().init();


