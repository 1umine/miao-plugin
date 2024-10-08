import fs from 'node:fs'
import lodash from 'lodash'
import { exec } from 'child_process'
import { Cfg, Common, Data, Version, App } from '#miao'
import makemsg from '../../../lib/common/common.js'
import { execSync } from 'child_process'
import fetch from 'node-fetch'
import { miaoPath } from '#miao.path'

let keys = lodash.map(Cfg.getCfgSchemaMap(), (i) => i.key)
let app = App.init({
  id: 'admin',
  name: '喵喵设置',
  desc: '喵喵设置'
})

let sysCfgReg = new RegExp(`^#喵喵设置\\s*(${keys.join('|')})?\\s*(.*)$`)

app.reg({
  updateRes: {
    rule: /^#喵喵(强制)?(更新图像|图像更新)$/,
    fn: updateRes,
    desc: '【#管理】更新素材'
  },
  updateResSource: {
    rule: /^#喵喵切换图源.+$/,
    fn: updateResSource,
    desc: '【#管理】切换加量图源'
  },
  update: {
    rule: /^#喵喵(强制)?更新$/,
    fn: updateMiaoPlugin,
    desc: '【#管理】喵喵更新'
  },
  updatelog: {
    rule: /^#?喵喵更新日志$/,
    fn: Miaoupdatelog,
    desc: '【#管理】喵喵更新'
  },
  sysCfg: {
    rule: sysCfgReg,
    fn: sysCfg,
    desc: '【#管理】系统设置'
  },
  miaoApiInfo: {
    rule: /^#喵喵api$/,
    fn: miaoApiInfo,
    desc: '【#管理】喵喵Api'
  }
})

export default app

const resPath = `${miaoPath}/resources/`
const plusPath = `${resPath}/miao-res-plus/`

const checkAuth = async function (e) {
  if (!e.isMaster) {
    e.reply(`只有主人才能命令喵喵哦~
    (*/ω＼*)`)
    return false
  }
  return true
}

async function sysCfg (e) {
  if (!await checkAuth(e)) {
    return true
  }

  let cfgReg = sysCfgReg
  let regRet = cfgReg.exec(e.msg)
  let cfgSchemaMap = Cfg.getCfgSchemaMap()

  if (!regRet) {
    return true
  }

  if (regRet[1]) {
    // 设置模式
    let val = regRet[2] || ''

    let cfgSchema = cfgSchemaMap[regRet[1]]
    if (cfgSchema.input) {
      val = cfgSchema.input(val)
    } else if (cfgSchema.type === 'str') {
      val = (val || cfgSchema.def) + ''
    } else {
      val = cfgSchema.type === 'num' ? (val * 1 || cfgSchema.def) : !/关闭/.test(val)
    }
    Cfg.set(cfgSchema.cfgKey, val)
  }

  let schema = Cfg.getCfgSchema()
  let cfg = Cfg.getCfg()
  let imgPlus = fs.existsSync(plusPath)

  // 渲染图像
  return await Common.render('admin/index', {
    schema,
    cfg,
    imgPlus,
    isMiao: Version.isMiao
  }, { e, scale: 1.4 })
}

async function updateRes (e) {
  if (!await checkAuth(e)) {
    return true
  }
  let isForce = e.msg.includes('强制')
  let command = ''
  if (fs.existsSync(`${resPath}/miao-res-plus/`)) {
    e.reply('开始尝试更新，请耐心等待~')
    command = 'git pull'
    if (isForce) {
      command = 'git  checkout . && git  pull'
    }
    exec(command, { cwd: `${resPath}/miao-res-plus/` }, function (error, stdout, stderr) {
      if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout)) {
        e.reply('目前所有图片都已经是最新了~')
        return true
      }
      let numRet = /(\d*) files changed,/.exec(stdout)
      if (numRet && numRet[1]) {
        e.reply(`报告主人，更新成功，此次更新了${numRet[1]}个图片~`)
        return true
      }
      if (error) {
        e.reply('更新失败！\nError code: ' + error.code + '\n' + error.stack + '\n 请稍后重试。')
      } else {
        e.reply('图片加量包更新成功~')
      }
    })
  } else {
    command = `git clone https://gitee.com/yoimiya-kokomi/miao-res-plus.git "${resPath}/miao-res-plus/" --depth=1`
    e.reply('开始尝试安装图片加量包，可能会需要一段时间，请耐心等待~')
    exec(command, function (error, stdout, stderr) {
      if (error) {
        e.reply('角色图片加量包安装失败！\nError code: ' + error.code + '\n' + error.stack + '\n 请稍后重试。')
      } else {
        e.reply('角色图片加量包安装成功！您后续也可以通过 #喵喵更新图像 命令来更新图像')
      }
    })
  }
  return true
}

async function updateResSource(e) {
  if (!await checkAuth(e)) {
    return true
  }
  let sourceUrl = e.msg.replace('#喵喵切换图源', '').trim()
  if (!sourceUrl) {
    e.reply('请指定加量图源 git 链接')
    return
  }
  let command = `git remote set-url origin ${sourceUrl}`
  exec(command, { cwd: `${resPath}/miao-res-plus/`, windowsHide: true }, function (error, stdout, stderr) {
    if (error) {
      e.reply('切换图源失败！\nError code: ' + error.code + '\n' + error.stack + '\n 请稍后重试。')
    } else {
      e.reply('图源切换成功~ 当前图源为：' + sourceUrl)
    }
  })
}

let timer

async function updateMiaoPlugin (e) {
  if (!await checkAuth(e)) {
    return true
  }
  let isForce = e.msg.includes('强制')
  let command = 'git  pull'
  if (isForce) {
    command = 'git fetch --all && git reset --hard origin/master && git pull'
    e.reply('正在执行强制更新操作，请稍等')
  } else {
    e.reply('正在执行更新操作，请稍等')
  }
  exec(command, { cwd: miaoPath, windowsHide: true }, function (error, stdout, stderr) {
    if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout) && !isForce) {
      e.reply('目前已经是最新版喵喵了~')
      return true
    }
    if (error) {
      e.reply('喵喵更新失败！\nError code: ' + error.code + '\n' + error.stack + '\n 请稍后重试。')
      return true
    }
    e.reply(`喵喵${isForce ? "强制" : ""}更新成功，正在尝试重新启动Yunzai以应用更新...`)
    timer && clearTimeout(timer)
    Data.setCacheJSON('miao:restart-msg', {
      msg: '重启成功，新版喵喵已经生效',
      qq: e.user_id
    }, 30)
    timer = setTimeout(function () {
      // 需要以 node app 方式启动，依赖 spawnSync
      console.log("=================\nReady exit for restart\n=================")
      process.exit()
    }, 1000)
  })
  return true
}

async function Miaoupdatelog (e, plugin = 'miao-plugin') {
  let cm = 'git log  -20 --oneline --pretty=format:"%h||[%cd]  %s" --date=format:"%F %T"'
  if (plugin) {
    cm = `cd ./plugins/${plugin}/ && ${cm}`
  }
  let logAll
  try {
    logAll = await execSync(cm, { encoding: 'utf-8', windowsHide: true })
  } catch (error) {
    logger.error(error.toString())
    this.reply(error.toString())
  }
  if (!logAll) return false
  logAll = logAll.split('\n')
  let log = []
  for (let str of logAll) {
    str = str.split('||')
    if (str[0] == this.oldCommitId) break
    if (str[1].includes('Merge branch')) continue
    log.push(str[1])
  }
  let line = log.length
  log = log.join('\n\n')
  if (log.length <= 0) return ''
  let end = '更多详细信息，请前往gitee查看\nhttps://gitee.com/yoimiya-kokomi/miao-plugin'
  log = await makemsg.makeForwardMsg(this.e, [log, end], `${plugin}更新日志，共${line}条`)
  e.reply(log)
}

async function miaoApiInfo (e) {
  if (!await checkAuth(e)) {
    return true
  }
  let { diyCfg } = await Data.importCfg('profile')
  let { qq, token } = (diyCfg?.miaoApi || {})
  if (!qq || !token) {
    return e.reply('未正确填写miaoApi token，请检查miao-plugin/config/profile.js文件')
  }
  if (token.length !== 32) {
    return e.reply('miaoApi token格式错误')
  }
  let req = await fetch(`http://miao.games/api/info?qq=${qq}&token=${token}`)
  let data = await req.json()
  if (data.status !== 0) {
    return e.reply('token检查错误，请求失败')
  }
  e.reply(data.msg)
}
